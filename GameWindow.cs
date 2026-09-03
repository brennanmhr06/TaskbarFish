using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.Linq;

namespace AquariumTaskbar;

internal sealed class GameWindow : Form
{
    private bool _placed;
    private bool _topMenuOpen;
    private readonly Aquarium _aquarium = new();
    private readonly System.Windows.Forms.Timer _animationTimer;
    private bool _isDragging;
    private Bitmap? _cachedMenuBackground;
    private Bitmap? _cachedTankBackground;

    public GameWindow()
    {
        Text = "AquariumTaskbar";
        FormBorderStyle = FormBorderStyle.None;
        StartPosition = FormStartPosition.Manual;
        ShowInTaskbar = true;
        TopMost = true;
        KeyPreview = true;
        DoubleBuffered = true;

        try
        {
            var iconStream = GetType().Assembly.GetManifestResourceStream("AquariumTaskbar.icons.logo.jpg");
            if (iconStream != null)
            {
                using var bitmap = new Bitmap(iconStream);
                Icon = Icon.FromHandle(bitmap.GetHicon());
            }
        }
        catch
        {
        }

        _animationTimer = new System.Windows.Forms.Timer { Interval = 16 };
        _animationTimer.Tick += AnimationTimer_Tick;
        _animationTimer.Start();
    }

    protected override CreateParams CreateParams
    {
        get
        {
            var createParams = base.CreateParams;
            createParams.ExStyle |= Native.WsExLayered;
            return createParams;
        }
    }

    protected override void OnHandleCreated(EventArgs e)
    {
        base.OnHandleCreated(e);
        PlaceAndPaint();
    }

    protected override void WndProc(ref Message m)
    {
        const int wmNcHitTest = 0x0084;
        const int htClient = 0x0001;
        const int htCaption = 0x0002;

        if (m.Msg == wmNcHitTest)
        {
            int lp = m.LParam.ToInt32();
            var screen = new Point(unchecked((short)lp), unchecked((short)(lp >> 16)));
            var client = PointToClient(screen);

            int menuOffset = _topMenuOpen ? Metrics.MenuHeight : 0;
            bool onControls = Metrics.ButtonBounds(menuOffset).Contains(client)
                || (_topMenuOpen && Metrics.MenuBounds.Contains(client));

            m.Result = (IntPtr)(onControls ? htClient : htCaption);
            return;
        }

        base.WndProc(ref m);
    }

    protected override void OnMouseUp(MouseEventArgs e)
    {
        if (e.Button != MouseButtons.Left)
        {
            base.OnMouseUp(e);
            return;
        }

        int menuOffset = _topMenuOpen ? Metrics.MenuHeight : 0;
        if (Metrics.ButtonBounds(menuOffset).Contains(e.Location))
        {
            ToggleMenu();
            return;
        }

        if (_topMenuOpen && e.Location.Y < Metrics.MenuHeight)
        {
            if (Metrics.CloseButtonRect.Contains(e.Location))
            {
                Close();
                return;
            }

            if (Metrics.LevelButtonRect.Contains(e.Location))
            {
                return;
            }
        }

        base.OnMouseUp(e);

        if (_isDragging)
        {
            _isDragging = false;
            _animationTimer.Interval = 16;
            _cachedMenuBackground?.Dispose();
            _cachedMenuBackground = null;
            _cachedTankBackground?.Dispose();
            _cachedTankBackground = null;
        }
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
        if (e.KeyCode == Keys.Escape)
        {
            if (_topMenuOpen)
            {
                ToggleMenu();
                return;
            }

            Close();
            return;
        }

        base.OnKeyDown(e);
    }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);

        int menuOffset = _topMenuOpen ? Metrics.MenuHeight : 0;
        bool onControls = Metrics.ButtonBounds(menuOffset).Contains(e.Location)
            || (_topMenuOpen && Metrics.MenuBounds.Contains(e.Location));
            
        if (!onControls)
        {
            _isDragging = true;
            _animationTimer.Interval = 5;
        }
    }

    private void ToggleMenu()
    {
        _topMenuOpen = !_topMenuOpen;
        _cachedMenuBackground?.Dispose();
        _cachedMenuBackground = null;
        _cachedTankBackground?.Dispose();
        _cachedTankBackground = null;

        int newY = _topMenuOpen ? Top - Metrics.MenuHeight : Top + Metrics.MenuHeight;
        int height = Metrics.TankFrameHeight + (_topMenuOpen ? Metrics.MenuHeight : 0);
        Bounds = new Rectangle(Left, newY, Metrics.TankWidth, height);
        PaintWindow();
    }

    private void PlaceAndPaint()
    {
        if (!_placed)
        {
            var area = Screen.PrimaryScreen?.WorkingArea
                ?? new Rectangle(0, 0, Metrics.TankWidth, Metrics.TankFrameHeight);
            int x = area.X + (area.Width - Metrics.TankWidth) / 2;
            int y = area.Y + (area.Height - Metrics.TankFrameHeight) / 2;
            Bounds = new Rectangle(x, y, Metrics.TankWidth, Metrics.TankFrameHeight);
            _placed = true;
            _aquarium.Reset();
        }

        PaintWindow();
    }

    private void PaintWindow()
    {
        int extra = _topMenuOpen ? Metrics.MenuHeight : 0;
        using var frame = DrawFrame(new Size(Metrics.TankWidth, Metrics.TankFrameHeight + extra));
        Native.ApplyLayeredBitmap(this, frame);
    }

    private Bitmap DrawFrame(Size size)
    {
        var bitmap = new Bitmap(size.Width, size.Height, PixelFormat.Format32bppPArgb);
        using var graphics = Graphics.FromImage(bitmap);
        graphics.Clear(Color.Transparent);

        if (_isDragging)
        {
            graphics.PixelOffsetMode = PixelOffsetMode.Half;
            graphics.CompositingQuality = CompositingQuality.HighSpeed;
            graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.HighSpeed;
            graphics.TextRenderingHint = TextRenderingHint.SingleBitPerPixelGridFit;
        }
        else
        {
            graphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
            graphics.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
        }

        graphics.CompositingMode = CompositingMode.SourceOver;

        if (_topMenuOpen)
        {
            if (_isDragging && _cachedMenuBackground != null)
            {
                graphics.DrawImage(_cachedMenuBackground, 0, 0);
            }
            else
            {
                MenuRenderer.Draw(graphics, _aquarium.Time);
                if (_cachedMenuBackground == null || _cachedMenuBackground.Width != size.Width || _cachedMenuBackground.Height != Metrics.MenuHeight)
                {
                    _cachedMenuBackground?.Dispose();
                    _cachedMenuBackground = new Bitmap(size.Width, Metrics.MenuHeight, PixelFormat.Format32bppPArgb);
                    using var menuGraphics = Graphics.FromImage(_cachedMenuBackground);
                    menuGraphics.Clear(Color.Transparent);
                    menuGraphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    menuGraphics.CompositingQuality = CompositingQuality.HighQuality;
                    menuGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                    menuGraphics.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
                    menuGraphics.CompositingMode = CompositingMode.SourceOver;
                    MenuRenderer.Draw(menuGraphics, _aquarium.Time);
                }
            }
        }

        int menuOffset = _topMenuOpen ? Metrics.MenuHeight : 0;

        if (_isDragging && _cachedTankBackground != null)
        {
            graphics.DrawImage(_cachedTankBackground, 0, menuOffset);
        }
        else
        {
            TankRenderer.Draw(graphics, menuOffset, _aquarium);
            if (_cachedTankBackground == null || _cachedTankBackground.Width != size.Width || _cachedTankBackground.Height != Metrics.TankFrameHeight)
            {
                _cachedTankBackground?.Dispose();
                _cachedTankBackground = new Bitmap(size.Width, Metrics.TankFrameHeight, PixelFormat.Format32bppPArgb);
                using var tankGraphics = Graphics.FromImage(_cachedTankBackground);
                tankGraphics.Clear(Color.Transparent);
                tankGraphics.PixelOffsetMode = PixelOffsetMode.HighQuality;
                tankGraphics.CompositingQuality = CompositingQuality.HighQuality;
                tankGraphics.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                tankGraphics.TextRenderingHint = TextRenderingHint.AntiAliasGridFit;
                tankGraphics.CompositingMode = CompositingMode.SourceOver;
                TankRenderer.Draw(tankGraphics, 0, _aquarium);
            }
        }

        MenuRenderer.DrawToggleButton(graphics, menuOffset, _topMenuOpen);
        return bitmap;
    }

    private void AnimationTimer_Tick(object? sender, EventArgs e)
    {
        _aquarium.Tick(0.016f);
        PaintWindow();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _cachedMenuBackground?.Dispose();
            _cachedTankBackground?.Dispose();
            _animationTimer.Dispose();
        }
        base.Dispose(disposing);
    }
}
