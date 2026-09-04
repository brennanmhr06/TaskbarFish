using System.Drawing.Drawing2D;

namespace AquariumTaskbar.Rendering;

internal static class Sprites
{
    public static void Fish(Graphics graphics, float x, float y, bool right, Color body, Color fin, float time = 0f, float phase = 0f, float speed = 0.45f)
    {
        var clip = AnimationConfig.FishSwim;
        string[] map = clip.Frames[clip.FrameAt(time, phase, speed)];
        int pixel = clip.PixelSize;
        float width = clip.Width * pixel;
        float height = clip.Height * pixel;
        var palette = new FishPalette(body, fin);

        var state = graphics.Save();
        graphics.SmoothingMode = SmoothingMode.None;
        graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
        graphics.PixelOffsetMode = PixelOffsetMode.None;
        graphics.CompositingQuality = CompositingQuality.HighSpeed;
        graphics.TranslateTransform(MathF.Round(x), MathF.Round(y));
        if (!right)
        {
            graphics.ScaleTransform(-1f, 1f);
        }

        graphics.TranslateTransform(-MathF.Floor(width / 2f), -MathF.Floor(height / 2f));
        DrawPixelMap(graphics, map, pixel, palette, shadow: true);
        DrawPixelMap(graphics, map, pixel, palette, shadow: false);
        graphics.Restore(state);
    }

    private static void DrawPixelMap(Graphics graphics, string[] map, int pixel, FishPalette palette, bool shadow)
    {
        int ox = shadow ? 1 : 0;
        int oy = shadow ? 1 : 0;

        using var shadowBrush = new SolidBrush(palette.Shadow);
        using var outline = new SolidBrush(palette.Outline);
        using var bodyDark = new SolidBrush(palette.BodyDark);
        using var body = new SolidBrush(palette.Body);
        using var belly = new SolidBrush(palette.Belly);
        using var fin = new SolidBrush(palette.Fin);
        using var finDark = new SolidBrush(palette.FinDark);
        using var eyeWhite = new SolidBrush(palette.EyeWhite);
        using var pupil = new SolidBrush(palette.Pupil);
        using var shine = new SolidBrush(palette.Shine);
        using var mouth = new SolidBrush(palette.Mouth);

        for (int row = 0; row < map.Length; row++)
        {
            string cells = map[row];
            for (int col = 0; col < cells.Length; col++)
            {
                Brush? brush = cells[col] switch
                {
                    '.' or ' ' => null,
                    _ when shadow => shadowBrush,
                    '#' => outline,
                    'd' => bodyDark,
                    'b' => body,
                    'l' => belly,
                    'f' => fin,
                    'n' => finDark,
                    'W' => eyeWhite,
                    'E' => pupil,
                    'H' => shine,
                    'm' => mouth,
                    _ => null
                };

                if (brush is null)
                {
                    continue;
                }

                graphics.FillRectangle(brush, col * pixel + ox, row * pixel + oy, pixel, pixel);
            }
        }
    }

    public static void Bubble(Graphics graphics, int x, int y, int size)
    {
        using (var fill = new LinearGradientBrush(
                   new Rectangle(x, y, size, size),
                   Color.FromArgb(90, 100, 160, 200),
                   Color.FromArgb(20, 60, 100, 140),
                   LinearGradientMode.ForwardDiagonal))
        {
            graphics.FillEllipse(fill, x, y, size, size);
        }

        using var rim = new Pen(Color.FromArgb(150, 80, 140, 180), 1);
        graphics.DrawEllipse(rim, x, y, size, size);

        int highlightSize = Math.Max(2, size / 3);
        graphics.FillRectangle(Brushes.White, x + size / 4, y + size / 6, highlightSize, Math.Max(2, size / 4));

        if (size > 4)
        {
            graphics.FillRectangle(Brushes.White, x + size / 2, y + size / 3, 1, 1);
        }
    }

    public static void Decoration(Graphics graphics, Rectangle slot, int kind)
    {
        int cx = slot.X + slot.Width / 2;
        int cy = slot.Y + slot.Height / 2 + 1;
        switch (kind)
        {
            case 0:
                using (var stem = new Pen(Color.FromArgb(255, 36, 110, 72), 2f) { StartCap = LineCap.Round })
                using (var leaf = new SolidBrush(Color.FromArgb(255, 56, 168, 102)))
                {
                    graphics.DrawLine(stem, cx, cy + 10, cx, cy - 4);
                    graphics.FillRectangle(leaf, cx - 8, cy - 6, 8, 11);
                    graphics.FillRectangle(leaf, cx, cy - 8, 8, 12);
                    graphics.FillRectangle(leaf, cx - 4, cy - 12, 7, 9);
                }
                break;
            case 1:
                using (var coral = new SolidBrush(Color.FromArgb(255, 232, 96, 118)))
                {
                    graphics.FillRectangle(coral, cx - 3, cy - 10, 6, 14);
                    graphics.FillRectangle(coral, cx - 9, cy - 4, 7, 10);
                    graphics.FillRectangle(coral, cx + 2, cy - 3, 7, 10);
                }
                break;
            case 2:
                using (var chest = new LinearGradientBrush(
                           new Rectangle(cx - 9, cy - 6, 18, 14),
                           Color.FromArgb(255, 196, 132, 56),
                           Color.FromArgb(255, 140, 84, 32),
                           LinearGradientMode.Vertical))
                using (var lid = new SolidBrush(Color.FromArgb(255, 222, 168, 72)))
                using (var latch = new SolidBrush(Color.FromArgb(255, 255, 214, 96)))
                {
                    graphics.FillRectangle(chest, cx - 8, cy - 2, 16, 10);
                    graphics.FillRectangle(lid, cx - 9, cy - 7, 18, 6);
                    graphics.FillRectangle(latch, cx - 2, cy - 2, 4, 5);
                }
                break;
            case 3:
                using (var rock = new SolidBrush(Color.FromArgb(255, 168, 150, 118)))
                using (var hi = new SolidBrush(Color.FromArgb(90, 255, 255, 255)))
                {
                    graphics.FillRectangle(rock, cx - 9, cy - 2, 18, 12);
                    graphics.FillRectangle(rock, cx - 5, cy - 7, 11, 10);
                    graphics.FillRectangle(hi, cx - 3, cy - 5, 5, 3);
                }
                break;
            case 4:
                using (var shell = new SolidBrush(Color.FromArgb(255, 236, 214, 170)))
                using (var pearl = new LinearGradientBrush(
                           new Rectangle(cx - 4, cy - 5, 8, 8),
                           Color.FromArgb(255, 255, 255, 255),
                           Color.FromArgb(255, 180, 220, 240),
                           LinearGradientMode.ForwardDiagonal))
                {
                    graphics.FillRectangle(shell, cx - 10, cy - 4, 20, 16);
                    graphics.FillRectangle(pearl, cx - 4, cy - 4, 8, 8);
                }
                break;
            default:
                using (var wall = new SolidBrush(Color.FromArgb(255, 176, 148, 118)))
                using (var roof = new SolidBrush(Color.FromArgb(255, 214, 92, 92)))
                {
                    graphics.FillRectangle(wall, cx - 7, cy - 1, 14, 10);
                    graphics.FillPolygon(roof, [
                        new Point(cx, cy - 10),
                        new Point(cx + 10, cy),
                        new Point(cx - 10, cy)
                    ]);
                    graphics.FillRectangle(Brushes.White, cx - 2, cy + 3, 4, 6);
                }
                break;
        }
    }

    public static void NavGlyph(Graphics graphics, Rectangle bounds, int kind)
    {
        int cx = bounds.X + bounds.Width / 2;
        int cy = bounds.Y + bounds.Height / 2;
        float scale = bounds.Width / 30f; // Scale based on button size

        switch (kind)
        {
            case 0:
                {
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 60, 100, 150)), (int)(cx - 10 * scale), (int)(cy - 2 * scale), (int)(20 * scale), (int)(10 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 80, 120, 180)), (int)(cx - 10 * scale), (int)(cy - 8 * scale), (int)(20 * scale), (int)(6 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 255, 200, 100)), (int)(cx - 8 * scale), (int)(cy - 6 * scale), (int)(16 * scale), (int)(6 * scale));
                }
                break;
            case 1:
                {
                    graphics.FillEllipse(new SolidBrush(Color.FromArgb(255, 255, 140, 60)), (int)(cx - 8 * scale), (int)(cy - 4 * scale), (int)(16 * scale), (int)(8 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.White), (int)(cx - 3 * scale), (int)(cy - 5 * scale), (int)(6 * scale), (int)(10 * scale));
                    graphics.FillPolygon(new SolidBrush(Color.FromArgb(255, 255, 180, 80)), [new Point((int)(cx - 9 * scale), (int)cy), new Point((int)(cx - 13 * scale), (int)(cy - 4 * scale)), new Point((int)(cx - 5 * scale), (int)(cy - 3 * scale))]);
                }
                break;
            case 2:
                {
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 60, 80)), (int)(cx - 8 * scale), (int)(cy - 5 * scale), (int)(5 * scale), (int)(5 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 60, 80)), (int)(cx + 3 * scale), (int)(cy - 5 * scale), (int)(5 * scale), (int)(5 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 60, 80)), (int)(cx - 3 * scale), (int)(cy - 2 * scale), (int)(10 * scale), (int)(5 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 60, 80)), (int)(cx - 5 * scale), (int)(cy + 1 * scale), (int)(10 * scale), (int)(5 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 60, 80)), (int)(cx - 3 * scale), (int)(cy + 4 * scale), (int)(6 * scale), (int)(3 * scale));
                }
                break;
            case 3:
                {
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 255, 140, 60)), (int)(cx - 10 * scale), (int)(cy - 1 * scale), (int)(5 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 255, 140, 60)), (int)(cx - 3 * scale), (int)(cy - 3 * scale), (int)(5 * scale), (int)(4 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 255, 140, 60)), (int)(cx + 5 * scale), (int)cy, (int)(5 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 255, 140, 60)), (int)(cx - 5 * scale), (int)(cy + 3 * scale), (int)(5 * scale), (int)(3 * scale));
                }
                break;
            case 4:
                {
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 80, 180, 100)), (int)(cx - 2 * scale), (int)(cy - 1 * scale), (int)(5 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 80, 180, 100)), (int)(cx + 3 * scale), (int)(cy - 4 * scale), (int)(3 * scale), (int)(8 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 80, 180, 100)), (int)(cx + 6 * scale), (int)(cy - 1 * scale), (int)(5 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 60, 120, 180)), (int)cx, (int)(cy - 1 * scale), (int)(5 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 60, 120, 180)), (int)(cx - 3 * scale), (int)(cy - 4 * scale), (int)(3 * scale), (int)(8 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 60, 120, 180)), (int)(cx - 6 * scale), (int)(cy - 1 * scale), (int)(5 * scale), (int)(3 * scale));
                }
                break;
            case 5:
                {
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 220, 120, 160)), (int)(cx - 8 * scale), (int)(cy - 5 * scale), (int)(16 * scale), (int)(12 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 200, 60, 80)), (int)(cx - 1 * scale), (int)(cy - 5 * scale), (int)(2 * scale), (int)(12 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 200, 60, 80)), (int)(cx - 8 * scale), (int)(cy - 1 * scale), (int)(16 * scale), (int)(2 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 200, 60, 80)), (int)(cx - 5 * scale), (int)(cy - 8 * scale), (int)(10 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 200, 60, 80)), (int)(cx - 8 * scale), (int)(cy - 7 * scale), (int)(3 * scale), (int)(3 * scale));
                    graphics.FillRectangle(new SolidBrush(Color.FromArgb(255, 200, 60, 80)), (int)(cx + 5 * scale), (int)(cy - 7 * scale), (int)(3 * scale), (int)(3 * scale));
                }
                break;
        }
    }

    public static void Lock(Graphics graphics, Rectangle bounds)
    {
        int cx = bounds.X + bounds.Width / 2;
        int cy = bounds.Y + bounds.Height / 2;

        using var lockBody = new SolidBrush(Color.FromArgb(200, 60, 90, 130));
        graphics.FillRectangle(lockBody, cx - 7, cy - 3, 14, 12);

        using var shackle = new SolidBrush(Color.FromArgb(200, 80, 120, 160));
        graphics.FillRectangle(shackle, cx - 4, cy - 9, 8, 7);
        graphics.FillRectangle(shackle, cx - 5, cy - 8, 10, 1);

        using var keyhole = new SolidBrush(Color.FromArgb(150, 120, 160, 200));
        graphics.FillRectangle(keyhole, cx - 2, cy, 4, 4);
        graphics.FillRectangle(keyhole, cx - 1, cy + 2, 2, 3);
    }
}
