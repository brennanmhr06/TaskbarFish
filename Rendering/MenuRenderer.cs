using System.Drawing.Drawing2D;

namespace AquariumTaskbar.Rendering;

internal static class MenuRenderer
{
    public static void Draw(Graphics graphics, float time)
    {
        var panel = new Rectangle(0, 0, Metrics.TankWidth - 1, Metrics.MenuHeight);
        using (var shadow = Gfx.RoundedTopRect(new Rectangle(3, 5, panel.Width - 5, panel.Height - 3), 18))
        using (var shadowFill = new SolidBrush(Color.FromArgb(40, 15, 40, 60)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        using (var path = Gfx.RoundedTopRect(panel, 18))
        using (var fill = new LinearGradientBrush(
                   panel,
                   Color.FromArgb(248, 50, 100, 150),
                   Color.FromArgb(238, 25, 60, 90),
                   LinearGradientMode.Vertical))
        {
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(250, 60, 110, 160),
                    Color.FromArgb(245, 40, 80, 120),
                    Color.FromArgb(240, 30, 70, 100),
                    Color.FromArgb(235, 20, 50, 70)
                ],
                Positions = [0f, 0.33f, 0.66f, 1f]
            };
            graphics.FillPath(fill, path);
        }

        DrawCaustics(graphics, panel, time);
        DrawPixelatedSeaweed(graphics, panel, time);

        using (var path = Gfx.RoundedTopRect(panel, 18))
        using (var outer = new Pen(Color.FromArgb(230, 120, 200, 255), 2f))
        using (var inner = new Pen(Color.FromArgb(60, 50, 110, 150), 1.2f))
        {
            graphics.DrawPath(outer, path);
            var inset = Rectangle.Inflate(panel, -3, -3);
            inset.Height = panel.Height - 6;
            using var innerPath = Gfx.RoundedTopRect(inset, 15);
            graphics.DrawPath(inner, innerPath);
        }

        DrawHeader(graphics);
        DrawLevel(graphics);
        DrawBasicFish(graphics);
        DrawSize(graphics);
        DrawPlacedFish(graphics);
        DrawPlacedDecorations(graphics);
        DrawDock(graphics);
    }

    public static void DrawToggleButton(Graphics graphics, int menuOffset, bool menuOpen)
    {
        var bounds = Metrics.ButtonBounds(menuOffset);

        using (var shadow = Gfx.RoundedRect(new Rectangle(bounds.X + 2, bounds.Y + 3, bounds.Width, bounds.Height), 8))
        using (var shadowFill = new SolidBrush(Color.FromArgb(55, 10, 30, 50)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        using (var path = Gfx.RoundedRect(bounds, 8))
        using (var fill = new LinearGradientBrush(
                   new Point(bounds.Left, bounds.Top),
                   new Point(bounds.Left, bounds.Bottom),
                   Color.FromArgb(255, 80, 160, 220),
                   Color.FromArgb(255, 40, 100, 160)))
        using (var edge = new Pen(Palette.ButtonEdge, 2.2f))
        {
            graphics.FillPath(fill, path);
            graphics.DrawPath(edge, path);
        }

        int cx = bounds.X + bounds.Width / 2;
        int cy = bounds.Y + bounds.Height / 2 + 1;
        Point[] arrow = menuOpen
            ? [new(cx, cy - 6), new(cx + 7, cy + 4), new(cx - 7, cy + 4)]
            : [new(cx - 7, cy - 4), new(cx + 7, cy - 4), new(cx, cy + 6)];

        using var arrowBrush = new SolidBrush(Color.FromArgb(255, 240, 250, 255));
        graphics.FillPolygon(arrowBrush, arrow);
    }

    private static void DrawCaustics(Graphics graphics, Rectangle panel, float time)
    {
        var clip = graphics.Save();
        using var path = Gfx.RoundedTopRect(panel, 18);
        graphics.SetClip(path);

        using var pen = new Pen(Color.FromArgb(25, 60, 120, 160), 2f);
        for (int band = 0; band < 4; band++)
        {
            int y = 30 + band * 80;
            var points = new PointF[6];
            for (int i = 0; i < points.Length; i++)
            {
                float x = i * (panel.Width / 5f);
                float wave = MathF.Sin(time * 0.7f + i * 1.2f + band) * 4f;
                points[i] = new PointF(x, y + wave);
            }

            graphics.DrawLines(pen, points);
        }

        DrawPixelatedBubbles(graphics, panel, time);

        graphics.Restore(clip);
    }

    private static void DrawPixelatedBubbles(Graphics graphics, Rectangle panel, float time)
    {
        var bubbleCount = 8;
        for (int i = 0; i < bubbleCount; i++)
        {
            float t = time * 0.3f + i * 0.8f;
            float x = panel.Width * 0.15f + (i % 3) * panel.Width * 0.3f + MathF.Sin(t) * 10f;
            float y = panel.Height * 0.3f + ((t * 50f) % (panel.Height * 0.6f));
            float size = 4f + MathF.Sin(t * 2f + i) * 2f;

            int pixelSize = (int)size;
            var bubbleRect = new Rectangle((int)x, (int)y, pixelSize, pixelSize);

            using var bubbleFill = new SolidBrush(Color.FromArgb(40, 120, 180, 220));
            graphics.FillRectangle(bubbleFill, bubbleRect);

            using var highlight = new SolidBrush(Color.FromArgb(60, 150, 200, 255));
            graphics.FillRectangle(highlight, bubbleRect.X + 1, bubbleRect.Y + 1, 1, 1);
        }
    }

    private static void DrawHeader(Graphics graphics)
    {
        var headerRect = new Rectangle(10, 12, Metrics.TankWidth - 20, 40);
        Gfx.GlassCard(graphics, headerRect, 14);

        DrawPixelatedStars(graphics, headerRect);

        using var titleFont = new Font("Courier New", 13f, FontStyle.Bold);
        using var titleBrush = new SolidBrush(Palette.Ink);
        graphics.DrawString("Aquarium", titleFont, titleBrush, 20, 19);

        var chip = new Rectangle(120, 21, 48, 20);
        Gfx.FillRound(graphics, chip, 10, Color.FromArgb(180, 50, 120, 170), Color.FromArgb(180, 30, 80, 120));
        using var chipFont = new Font("Courier New", 7.5f, FontStyle.Bold);
        using var chipBrush = new SolidBrush(Color.White);
        Gfx.CenteredText(graphics, "LIVE", chipFont, chipBrush, chip);

        DrawPixelatedDroplets(graphics, headerRect);

        var closeRect = Metrics.CloseButtonRect;
        using (var closeFill = new LinearGradientBrush(
                   new Point(closeRect.Left, closeRect.Top),
                   new Point(closeRect.Left, closeRect.Bottom),
                   Color.FromArgb(255, 70, 110, 150),
                   Color.FromArgb(255, 40, 80, 110)))
        using (var ring = new Pen(Color.FromArgb(200, 130, 170, 220), 1.5f))
        {
            graphics.FillEllipse(closeFill, closeRect);
            graphics.DrawEllipse(ring, closeRect);
        }

        using var closeX = new Pen(Color.FromArgb(255, 210, 230, 250), 2f)
        {
            StartCap = LineCap.Round,
            EndCap = LineCap.Round
        };
        graphics.DrawLine(closeX, closeRect.X + 6, closeRect.Y + 6, closeRect.Right - 6, closeRect.Bottom - 6);
        graphics.DrawLine(closeX, closeRect.Right - 6, closeRect.Y + 6, closeRect.X + 6, closeRect.Bottom - 6);
    }

    private static void DrawPixelatedDroplets(Graphics graphics, Rectangle bounds)
    {
        using var droplet = new SolidBrush(Color.FromArgb(100, 80, 140, 200));
        graphics.FillRectangle(droplet, bounds.X + 4, bounds.Y + 2, 2, 2);
        graphics.FillRectangle(droplet, bounds.X + 8, bounds.Y + 6, 1, 1);
        graphics.FillRectangle(droplet, bounds.Right - 6, bounds.Y + 4, 2, 2);
        graphics.FillRectangle(droplet, bounds.Right - 10, bounds.Y + 8, 1, 1);
    }

    private static void DrawPixelatedStars(Graphics graphics, Rectangle bounds)
    {
        using var star = new SolidBrush(Color.FromArgb(80, 200, 220, 255));
        using var starDark = new SolidBrush(Color.FromArgb(60, 150, 180, 220));

        graphics.FillRectangle(star, bounds.X + 130, bounds.Y + 8, 2, 2);
        graphics.FillRectangle(star, bounds.X + 132, bounds.Y + 6, 2, 2);
        graphics.FillRectangle(star, bounds.X + 134, bounds.Y + 8, 2, 2);
        graphics.FillRectangle(star, bounds.X + 132, bounds.Y + 10, 2, 2);

        graphics.FillRectangle(starDark, bounds.X + 142, bounds.Y + 12, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 144, bounds.Y + 10, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 146, bounds.Y + 12, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 144, bounds.Y + 14, 2, 2);

        graphics.FillRectangle(star, bounds.X + 152, bounds.Y + 18, 2, 2);
        graphics.FillRectangle(star, bounds.X + 154, bounds.Y + 16, 2, 2);
        graphics.FillRectangle(star, bounds.X + 156, bounds.Y + 18, 2, 2);
        graphics.FillRectangle(star, bounds.X + 154, bounds.Y + 20, 2, 2);
    }

    private static void DrawLevel(Graphics graphics)
    {
        var card = new Rectangle(10, 58, Metrics.TankWidth - 20, 66);
        Gfx.GlassCard(graphics, card, 14);

        Gfx.SectionLabel(graphics, "AQUARIUM LEVEL", 20, 64);
        using var font = new Font("Courier New", 13f, FontStyle.Bold);
        using var brush = new SolidBrush(Palette.Ink);
        graphics.DrawString("4", font, brush, 20, 78);

        var expBar = new Rectangle(48, 88, Metrics.TankWidth - 180, 10);
        DrawXpBar(graphics, expBar, 0.42f);

        using var expFont = new Font("Courier New", 7.5f);
        using var muted = new SolidBrush(Palette.InkMuted);
        graphics.DrawString("210 / 500", expFont, muted, expBar.Right + 8, 87);

        Gfx.GlossyButton(graphics, Metrics.LevelButtonRect, Palette.Accent, Palette.AccentDeep);
        using var btnFont = new Font("Courier New", 8f, FontStyle.Bold);
        using var btnBrush = new SolidBrush(Color.White);
        Gfx.CenteredText(graphics, "LV  ↑", btnFont, btnBrush, Metrics.LevelButtonRect);
    }

    private static void DrawXpBar(Graphics graphics, Rectangle track, float progress)
    {
        Gfx.FillRound(graphics, track, 5, Color.FromArgb(100, 18, 50, 80), Color.FromArgb(130, 10, 35, 55));
        using (var inset = new Pen(Color.FromArgb(65, 70, 130, 175), 1.2f))
        using (var path = Gfx.RoundedRect(track, 5))
        {
            graphics.DrawPath(inset, path);
        }

        var clip = graphics.Save();
        using (var clipPath = Gfx.RoundedRect(track, 5))
        {
            graphics.SetClip(clipPath);
            int fillWidth = Math.Max(8, (int)(track.Width * progress));
            var filled = new Rectangle(track.X, track.Y, fillWidth, track.Height);
            Gfx.FillRound(graphics, filled, 5, Color.FromArgb(255, 70, 130, 190), Color.FromArgb(255, 40, 90, 130));
            using var shine = new LinearGradientBrush(
                filled,
                Color.FromArgb(165, 90, 130, 175),
                Color.FromArgb(20, 60, 100, 140),
                LinearGradientMode.Vertical);
            graphics.FillRectangle(shine, filled.X, filled.Y, filled.Width, 5);

            using var tip = new SolidBrush(Color.FromArgb(100, 110, 155, 195));
            graphics.FillEllipse(tip, filled.Right - 8, filled.Y - 1, 9, filled.Height + 2);
        }

        graphics.Restore(clip);
    }

    private static void DrawBasicFish(Graphics graphics)
    {
        var card = new Rectangle(10, 132, Metrics.TankWidth - 20, 56);
        Gfx.GlassCard(graphics, card, 14);

        var iconWell = new Rectangle(18, 142, 34, 34);
        Gfx.InsetWell(graphics, iconWell, 10);
        Sprites.Fish(graphics, 35, 159, true, Color.FromArgb(255, 255, 168, 64), Color.FromArgb(255, 230, 110, 40));

        DrawPixelatedWaterEffect(graphics, iconWell);

        using var font = new Font("Courier New", 10.5f, FontStyle.Bold);
        using var brush = new SolidBrush(Palette.Ink);
        using var muted = new SolidBrush(Palette.InkMuted);
        using var small = new Font("Courier New", 7.5f);
        graphics.DrawString("Basic Fish", font, brush, 60, 144);
        graphics.DrawString("Starter school", small, muted, 60, 163);

        var count = new Rectangle(Metrics.TankWidth - 58, 146, 36, 26);
        Gfx.InsetWell(graphics, count, 8);
        using var countFont = new Font("Courier New", 9.5f, FontStyle.Bold);
        Gfx.CenteredText(graphics, "×3", countFont, brush, count);
    }

    private static void DrawPixelatedWaterEffect(Graphics graphics, Rectangle bounds)
    {
        using var water = new SolidBrush(Color.FromArgb(40, 80, 140, 200));
        graphics.FillRectangle(water, bounds.Right + 2, bounds.Y + 4, 2, 2);
        graphics.FillRectangle(water, bounds.Right + 4, bounds.Y + 8, 1, 1);
        graphics.FillRectangle(water, bounds.X - 2, bounds.Bottom - 6, 2, 2);
        graphics.FillRectangle(water, bounds.X - 4, bounds.Bottom - 10, 1, 1);
    }

    private static void DrawSize(Graphics graphics)
    {
        var card = new Rectangle(10, 196, Metrics.TankWidth - 20, 50);
        Gfx.GlassCard(graphics, card, 14);
        Gfx.SectionLabel(graphics, "AQUARIUM SIZE", 20, 202);

        using var font = new Font("Courier New", 9f, FontStyle.Bold);
        using var brush = new SolidBrush(Palette.Ink);
        using var muted = new SolidBrush(Palette.InkMuted);
        using var mutedFont = new Font("Courier New", 8f);
        graphics.DrawString("2.6 m", font, brush, 20, 216);
        graphics.DrawString("wide", mutedFont, muted, 68, 218);
        graphics.DrawString("0.92 m", font, brush, 120, 216);
        graphics.DrawString("tall", mutedFont, muted, 172, 218);

        var chip = new Rectangle(Metrics.TankWidth - 92, 208, 70, 18);
        Gfx.FillRound(graphics, chip, 9, Color.FromArgb(175, 30, 80, 120), Color.FromArgb(175, 15, 50, 80));
        using var chipFont = new Font("Courier New", 7f, FontStyle.Bold);
        using var chipBrush = new SolidBrush(Color.White);
        Gfx.CenteredText(graphics, "COMPACT", chipFont, chipBrush, chip);

        using var line = new Pen(Color.FromArgb(50, 80, 120, 160), 1f);
        graphics.DrawLine(line, 16, 232, 180, 232);
        graphics.DrawLine(line, 16, 232, 16, 236);
        graphics.DrawLine(line, 180, 232, 180, 236);
    }

    private static void DrawPlacedFish(Graphics graphics)
    {
        var card = new Rectangle(10, 254, Metrics.TankWidth - 20, 76);
        Gfx.GlassCard(graphics, card, 14);
        Gfx.SectionLabel(graphics, "PLACED FISH", 20, 260);
        using var countFont = new Font("Courier New", 8f, FontStyle.Bold);
        using var countBrush = new SolidBrush(Palette.Accent);
        graphics.DrawString("0 / 6", countFont, countBrush, Metrics.TankWidth - 55, 259);

        DrawSlotRow(graphics, 274, i =>
        {
            var slot = SlotAt(274, i);
            var lockRect = new Rectangle(slot.X + slot.Width / 2 - 7, slot.Y + slot.Height / 2 - 7, 14, 14);
            Sprites.Lock(graphics, lockRect);
        });
    }

    private static void DrawPlacedDecorations(Graphics graphics)
    {
        var card = new Rectangle(10, 338, Metrics.TankWidth - 20, 76);
        Gfx.GlassCard(graphics, card, 14);
        Gfx.SectionLabel(graphics, "PLACED DECORATIONS", 20, 344);
        using var countFont = new Font("Courier New", 8f, FontStyle.Bold);
        using var countBrush = new SolidBrush(Palette.Accent);
        graphics.DrawString("0 / 6", countFont, countBrush, Metrics.TankWidth - 55, 343);

        DrawSlotRow(graphics, 358, i =>
        {
            var slot = SlotAt(358, i);
            var lockRect = new Rectangle(slot.X + slot.Width / 2 - 7, slot.Y + slot.Height / 2 - 7, 14, 14);
            Sprites.Lock(graphics, lockRect);
        });
    }

    private static void DrawSlotRow(Graphics graphics, int y, Action<int> drawItem)
    {
        for (int i = 0; i < 6; i++)
        {
            var slot = SlotAt(y, i);
            Gfx.InsetWell(graphics, slot, 11);
            drawItem(i);
        }
    }

    private static Rectangle SlotAt(int y, int index)
    {
        const int slotSize = 40;
        const int gap = 6;
        int startX = 18;
        return new Rectangle(startX + index * (slotSize + gap), y, slotSize, slotSize);
    }

    private static void DrawDock(Graphics graphics)
    {
        var dock = new Rectangle(10, Metrics.MenuHeight - 54, Metrics.TankWidth - 20, 44);
        Gfx.GlassCard(graphics, dock, 14);

        DrawPixelatedWaves(graphics, dock);

        int iconSize = 38;
        int spacing = 50;
        int totalButtons = 6;
        int totalWidth = totalButtons * iconSize + (totalButtons - 1) * spacing;
        int startX = dock.X + (dock.Width - totalWidth) / 2;
        int y = dock.Y + 3;

        Color[] colors =
        [
            Color.FromArgb(255, 70, 110, 160),
            Color.FromArgb(255, 80, 120, 170),
            Color.FromArgb(255, 90, 130, 180),
            Color.FromArgb(255, 80, 120, 170),
            Color.FromArgb(255, 70, 110, 160),
            Color.FromArgb(255, 80, 120, 170)
        ];

        for (int i = 0; i < 6; i++)
        {
            var iconRect = new Rectangle(startX + i * (iconSize + spacing), y, iconSize, iconSize);
            bool selected = i == 0;
            if (selected)
            {
                using var glow = new SolidBrush(Color.FromArgb(140, 100, 170, 240));
                graphics.FillRectangle(glow, Rectangle.Inflate(iconRect, 6, 6));
            }

            // Enhanced gradient fill with inner glow
            using (var fill = new LinearGradientBrush(
                       new Point(iconRect.Left, iconRect.Top),
                       new Point(iconRect.Left, iconRect.Bottom),
                       selected ? Color.FromArgb(255, 140, 180, 240) : ControlPaint.Light(colors[i]),
                       colors[i]))
            using (var ring = new Pen(selected ? Color.FromArgb(255, 120, 170, 240) : Color.FromArgb(255, 80, 130, 190), selected ? 2.5f : 2f))
            using (var path = Gfx.RoundedRect(iconRect, 9))
            {
                graphics.FillPath(fill, path);
                graphics.DrawPath(ring, path);

                if (selected)
                {
                    using var innerRing = new Pen(Color.FromArgb(90, 110, 170, 220), 1f);
                    using var innerPath = Gfx.RoundedRect(Rectangle.Inflate(iconRect, -4, -4), 6);
                    graphics.DrawPath(innerRing, innerPath);
                }
            }

            Sprites.NavGlyph(graphics, iconRect, i);
        }
    }

    private static void DrawPixelatedWaves(Graphics graphics, Rectangle bounds)
    {
        using var wave = new SolidBrush(Color.FromArgb(30, 60, 100, 140));
        for (int i = 0; i < bounds.Width; i += 8)
        {
            int waveHeight = 2 + (i % 4);
            graphics.FillRectangle(wave, bounds.X + i, bounds.Bottom - waveHeight, 4, waveHeight);
        }
    }

    private static void DrawPixelatedSeaweed(Graphics graphics, Rectangle panel, float time)
    {
        var clip = graphics.Save();
        using var path = Gfx.RoundedTopRect(panel, 18);
        graphics.SetClip(path);

        using var seaweed = new SolidBrush(Color.FromArgb(50, 60, 140, 90));
        using var seaweedDark = new SolidBrush(Color.FromArgb(50, 40, 100, 70));

        for (int i = 0; i < 3; i++)
        {
            float sway = MathF.Sin(time * 0.5f + i * 1.5f) * 3f;
            int x = 15 + i * 8;
            int height = 60 + i * 20;

            graphics.FillRectangle(seaweed, x, panel.Height - height, 4, height);
            graphics.FillRectangle(seaweed, x + 4, panel.Height - height + 10, 3, height - 10);
            graphics.FillRectangle(seaweed, x - 2, panel.Height - height + 20, 3, height - 20);

            graphics.FillRectangle(seaweedDark, x + 5, panel.Height - height + 30 + (int)sway, 6, 4);
            graphics.FillRectangle(seaweedDark, x - 3, panel.Height - height + 50 - (int)sway, 5, 3);
        }

        for (int i = 0; i < 3; i++)
        {
            float sway = MathF.Sin(time * 0.5f + i * 1.5f + 2f) * 3f;
            int x = panel.Width - 25 - i * 8;
            int height = 50 + i * 15;

            graphics.FillRectangle(seaweed, x, panel.Height - height, 4, height);
            graphics.FillRectangle(seaweed, x - 4, panel.Height - height + 10, 3, height - 10);
            graphics.FillRectangle(seaweed, x + 2, panel.Height - height + 20, 3, height - 20);

            graphics.FillRectangle(seaweedDark, x - 5, panel.Height - height + 25 + (int)sway, 6, 4);
            graphics.FillRectangle(seaweedDark, x + 3, panel.Height - height + 45 - (int)sway, 5, 3);
        }

        graphics.Restore(clip);
    }
}
