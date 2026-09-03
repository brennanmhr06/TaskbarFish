using System.Drawing.Drawing2D;

namespace AquariumTaskbar.Drawing;

internal static class Gfx
{
    public static void FillRound(Graphics graphics, Rectangle bounds, int radius, Color top, Color bottom)
    {
        if (bounds.Width <= 0 || bounds.Height <= 0)
        {
            return;
        }

        using var path = RoundedRect(bounds, radius);
        using var fill = new LinearGradientBrush(bounds, top, bottom, LinearGradientMode.Vertical);
        graphics.FillPath(fill, path);
    }

    public static void GlassCard(Graphics graphics, Rectangle bounds, int radius)
    {
        using (var shadow = RoundedRect(new Rectangle(bounds.X, bounds.Y + 3, bounds.Width, bounds.Height), radius))
        using (var shadowFill = new SolidBrush(Color.FromArgb(35, 12, 28, 45)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        FillRound(graphics, bounds, radius, Palette.CardTop, Palette.CardBottom);

        using var path = RoundedRect(bounds, radius);
        using var edge = new Pen(Color.FromArgb(195, 90, 150, 210), 1.4f);
        graphics.DrawPath(edge, path);

        using var innerPath = RoundedRect(Rectangle.Inflate(bounds, -2, -2), Math.Max(2, radius - 2));
        using var innerEdge = new Pen(Color.FromArgb(60, 70, 130, 170), 0.8f);
        graphics.DrawPath(innerEdge, innerPath);

        var state = graphics.Save();
        graphics.SetClip(path);
        var shine = new Rectangle(bounds.X + 6, bounds.Y + 1, bounds.Width - 12, Math.Max(8, bounds.Height / 3));
        using var shineBrush = new LinearGradientBrush(
            shine,
            Color.FromArgb(85, 110, 170, 215),
            Color.FromArgb(10, 70, 110, 150),
            LinearGradientMode.Vertical);
        using var shinePath = RoundedRect(shine, Math.Max(4, radius - 4));
        graphics.FillPath(shineBrush, shinePath);
        graphics.Restore(state);
    }

    public static void InsetWell(Graphics graphics, Rectangle bounds, int radius)
    {
        FillRound(graphics, bounds, radius, Color.FromArgb(85, 18, 45, 70), Color.FromArgb(115, 10, 30, 50));
        using var highlight = new Pen(Color.FromArgb(95, 90, 150, 215), 1.2f);
        using var path = RoundedRect(Rectangle.Inflate(bounds, -1, -1), Math.Max(2, radius - 1));
        graphics.DrawPath(highlight, path);

        using var innerGlow = new Pen(Color.FromArgb(50, 60, 110, 150), 0.6f);
        using var innerPath = RoundedRect(Rectangle.Inflate(bounds, -2, -2), Math.Max(2, radius - 2));
        graphics.DrawPath(innerGlow, innerPath);
    }

    public static void GlossyButton(Graphics graphics, Rectangle bounds, Color top, Color bottom)
    {
        using (var shadow = RoundedRect(new Rectangle(bounds.X, bounds.Y + 3, bounds.Width, bounds.Height), 9))
        using (var shadowFill = new SolidBrush(Color.FromArgb(45, 12, 28, 45)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        FillRound(graphics, bounds, 9, top, bottom);
        using var shine = new LinearGradientBrush(
            bounds,
            Color.FromArgb(145, 110, 170, 220),
            Color.FromArgb(15, 70, 110, 150),
            LinearGradientMode.Vertical);
        graphics.FillRectangle(shine, bounds.X + 4, bounds.Y + 1, bounds.Width - 8, bounds.Height / 2);
        using var edge = new Pen(Color.FromArgb(165, 90, 150, 215), 1.3f);
        using var path = RoundedRect(bounds, 9);
        graphics.DrawPath(edge, path);

        using var innerEdge = new Pen(Color.FromArgb(70, 80, 140, 180), 0.7f);
        using var innerPath = RoundedRect(Rectangle.Inflate(bounds, -2, -2), 7);
        graphics.DrawPath(innerEdge, innerPath);
    }

    public static void SectionLabel(Graphics graphics, string text, int x, int y)
    {
        using var font = new Font("Courier New", 7f, FontStyle.Bold);
        using var brush = new SolidBrush(Palette.InkMuted);
        graphics.DrawString(text, font, brush, x, y);
    }

    public static void CenteredText(Graphics graphics, string text, Font font, Brush brush, Rectangle bounds)
    {
        using var format = new StringFormat
        {
            Alignment = StringAlignment.Center,
            LineAlignment = StringAlignment.Center,
            FormatFlags = StringFormatFlags.NoWrap
        };
        graphics.DrawString(text, font, brush, bounds, format);
    }

    public static GraphicsPath RoundedRect(Rectangle bounds, int radius)
    {
        int diameter = Math.Max(2, radius * 2);
        diameter = Math.Min(diameter, Math.Min(bounds.Width, bounds.Height));
        var path = new GraphicsPath();
        path.AddArc(bounds.X, bounds.Y, diameter, diameter, 180, 90);
        path.AddArc(bounds.Right - diameter, bounds.Y, diameter, diameter, 270, 90);
        path.AddArc(bounds.Right - diameter, bounds.Bottom - diameter, diameter, diameter, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - diameter, diameter, diameter, 90, 90);
        path.CloseFigure();
        return path;
    }

    public static GraphicsPath RoundedTopRect(Rectangle bounds, int radius)
    {
        int diameter = Math.Max(2, radius * 2);
        diameter = Math.Min(diameter, Math.Min(bounds.Width, bounds.Height));
        var path = new GraphicsPath();
        path.AddArc(bounds.X, bounds.Y, diameter, diameter, 180, 90);
        path.AddArc(bounds.Right - diameter, bounds.Y, diameter, diameter, 270, 90);
        path.AddLine(bounds.Right, bounds.Y + radius, bounds.Right, bounds.Bottom);
        path.AddLine(bounds.Right, bounds.Bottom, bounds.X, bounds.Bottom);
        path.AddLine(bounds.X, bounds.Bottom, bounds.X, bounds.Y + radius);
        path.CloseFigure();
        return path;
    }
}
