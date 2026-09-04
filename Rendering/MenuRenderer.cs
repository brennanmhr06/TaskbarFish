using System.Drawing.Drawing2D;

namespace AquariumTaskbar.Rendering;

internal static class MenuRenderer
{
    public static void Draw(Graphics graphics, float time)
    {
        var panel = new Rectangle(0, 0, Metrics.TankWidth - 1, Metrics.MenuHeight);
        
        // Enhanced multi-layered shadow with glow
        using (var shadowGlow = Gfx.RoundedTopRect(new Rectangle(6, 8, panel.Width - 9, panel.Height - 5), 18))
        using (var shadowGlowFill = new SolidBrush(Color.FromArgb(60, 20, 60, 100)))
        {
            graphics.FillPath(shadowGlowFill, shadowGlow);
        }
        
        using (var shadow = Gfx.RoundedTopRect(new Rectangle(4, 6, panel.Width - 7, panel.Height - 4), 18))
        using (var shadowFill = new SolidBrush(Color.FromArgb(50, 25, 55, 85)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        // Vibrant multi-stop gradient background
        using (var path = Gfx.RoundedTopRect(panel, 18))
        using (var fill = new LinearGradientBrush(
                   panel,
                   Color.FromArgb(252, 80, 140, 200),
                   Color.FromArgb(248, 45, 100, 160),
                   LinearGradientMode.Vertical))
        {
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(255, 100, 160, 220),
                    Color.FromArgb(252, 85, 145, 200),
                    Color.FromArgb(248, 70, 130, 180),
                    Color.FromArgb(245, 55, 115, 160),
                    Color.FromArgb(242, 40, 100, 140),
                    Color.FromArgb(238, 30, 85, 120)
                ],
                Positions = [0f, 0.2f, 0.4f, 0.6f, 0.8f, 1f]
            };
            graphics.FillPath(fill, path);
            
            // Add top highlight/stripe
            using var highlight = new LinearGradientBrush(
                new Rectangle(panel.X, panel.Y, panel.Width, 25),
                Color.FromArgb(60, 200, 230, 255),
                Color.FromArgb(30, 150, 200, 240),
                LinearGradientMode.Vertical);
            graphics.FillRectangle(highlight, panel.X, panel.Y, panel.Width, 15);
        }

        DrawCaustics(graphics, panel, time);
        DrawPixelatedSeaweed(graphics, panel, time);

        // Enhanced border with gradient stroke
        using (var path = Gfx.RoundedTopRect(panel, 18))
        using (var outer = new Pen(Color.FromArgb(240, 160, 210, 255), 2.5f))
        using (var outerGlow = new Pen(Color.FromArgb(40, 120, 190, 255), 1.5f))
        {
            graphics.DrawPath(outerGlow, path);
            graphics.DrawPath(outer, path);
            
            var inset = Rectangle.Inflate(panel, -4, -4);
            inset.Height = panel.Height - 8;
            using var innerPath = Gfx.RoundedTopRect(inset, 16);
            using var inner = new Pen(Color.FromArgb(80, 100, 160, 200), 1.5f);
            graphics.DrawPath(inner, innerPath);
        }

        DrawHeader(graphics);
        DrawLevel(graphics);
        DrawBasicFish(graphics, time);
        DrawSize(graphics);
        DrawPlacedFish(graphics);
        DrawPlacedDecorations(graphics);
        DrawDock(graphics);
    }

    public static void DrawToggleButton(Graphics graphics, int menuOffset, bool menuOpen)
    {
        var bounds = Metrics.ButtonBounds(menuOffset);

        // Enhanced multi-layered shadow with glow
        using (var shadowGlow = Gfx.RoundedRect(new Rectangle(bounds.X + 3, bounds.Y + 5, bounds.Width, bounds.Height), 8))
        using (var shadowGlowFill = new SolidBrush(Color.FromArgb(70, 25, 55, 85)))
        {
            graphics.FillPath(shadowGlowFill, shadowGlow);
        }
        
        using (var shadow = Gfx.RoundedRect(new Rectangle(bounds.X + 2, bounds.Y + 3, bounds.Width, bounds.Height), 8))
        using (var shadowFill = new SolidBrush(Color.FromArgb(60, 18, 45, 70)))
        {
            graphics.FillPath(shadowFill, shadow);
        }

        // Enhanced gradient fill with vibrant colors
        using (var path = Gfx.RoundedRect(bounds, 8))
        using (var fill = new LinearGradientBrush(
                   new Point(bounds.Left, bounds.Top),
                   new Point(bounds.Left, bounds.Bottom),
                   Color.FromArgb(255, 120, 200, 255),
                   Color.FromArgb(255, 70, 150, 210)))
        {
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(255, 140, 220, 255),
                    Color.FromArgb(255, 120, 200, 255),
                    Color.FromArgb(255, 90, 170, 230),
                    Color.FromArgb(255, 70, 150, 210)
                ],
                Positions = [0f, 0.3f, 0.7f, 1f]
            };
            graphics.FillPath(fill, path);
            
            // Add top highlight
            using var topHighlight = new SolidBrush(Color.FromArgb(120, 230, 255, 255));
            graphics.FillRectangle(topHighlight, bounds.X + 3, bounds.Y + 1, bounds.Width - 6, 3);
            
            // Enhanced outer edge with glow
            using var edge = new Pen(Color.FromArgb(255, 150, 210, 255), 2.5f);
            graphics.DrawPath(edge, path);
            
            using var edgeGlow = new Pen(Color.FromArgb(100, 180, 230, 255), 1.5f);
            graphics.DrawPath(edgeGlow, path);
            
            // Enhanced inner edge
            using var innerEdge = new Pen(Color.FromArgb(120, 160, 210, 250), 1f);
            using var innerPath = Gfx.RoundedRect(Rectangle.Inflate(bounds, -2, -2), 6);
            graphics.DrawPath(innerEdge, innerPath);
        }

        int cx = bounds.X + bounds.Width / 2;
        int cy = bounds.Y + bounds.Height / 2 + 1;
        Point[] arrow = menuOpen
            ? [new(cx, cy - 6), new(cx + 7, cy + 4), new(cx - 7, cy + 4)]
            : [new(cx - 7, cy - 4), new(cx + 7, cy - 4), new(cx, cy + 6)];

        // Enhanced arrow with glow
        using var arrowBrush = new SolidBrush(Color.FromArgb(255, 250, 255, 255));
        graphics.FillPolygon(arrowBrush, arrow);
        
        using var arrowGlow = new Pen(Color.FromArgb(150, 200, 255, 255), 2f)
        {
            StartCap = LineCap.Round,
            EndCap = LineCap.Round
        };
        graphics.DrawPolygon(arrowGlow, arrow);
    }

    private static void DrawCaustics(Graphics graphics, Rectangle panel, float time)
    {
        var clip = graphics.Save();
        using var path = Gfx.RoundedTopRect(panel, 18);
        graphics.SetClip(path);

        // Enhanced caustics with multiple wave layers and vibrant colors
        using var pen = new Pen(Color.FromArgb(35, 100, 170, 230), 2.5f);
        using var penGlow = new Pen(Color.FromArgb(25, 130, 200, 255), 1.5f);
        
        for (int band = 0; band < 5; band++)
        {
            int y = 25 + band * 75;
            var points = new PointF[7];
            for (int i = 0; i < points.Length; i++)
            {
                float x = i * (panel.Width / 6f);
                float wave = MathF.Sin(time * 0.8f + i * 1.3f + band * 0.5f) * 5f;
                float secondaryWave = MathF.Cos(time * 0.5f + i * 0.8f + band) * 2f;
                points[i] = new PointF(x, y + wave + secondaryWave);
            }

            graphics.DrawLines(penGlow, points);
            graphics.DrawLines(pen, points);
        }

        // Add additional light rays
        using var rayPen = new Pen(Color.FromArgb(20, 150, 220, 255), 1f);
        for (int ray = 0; ray < 3; ray++)
        {
            float rayX = panel.Width * 0.2f + ray * panel.Width * 0.3f + MathF.Sin(time * 0.3f + ray) * 15f;
            var rayPoints = new PointF[4];
            for (int i = 0; i < rayPoints.Length; i++)
            {
                float rayY = 10 + i * 80;
                float wave = MathF.Sin(time * 0.4f + i + ray) * 3f;
                rayPoints[i] = new PointF(rayX + wave, rayY);
            }
            graphics.DrawLines(rayPen, rayPoints);
        }

        DrawPixelatedBubbles(graphics, panel, time);

        graphics.Restore(clip);
    }

    private static void DrawPixelatedBubbles(Graphics graphics, Rectangle panel, float time)
    {
        var bubbleCount = 12;
        for (int i = 0; i < bubbleCount; i++)
        {
            float t = time * 0.4f + i * 0.7f;
            float x = panel.Width * 0.1f + (i % 4) * panel.Width * 0.25f + MathF.Sin(t * 1.2f + i) * 12f;
            float y = panel.Height * 0.25f + ((t * 45f) % (panel.Height * 0.65f));
            float size = 3f + MathF.Sin(t * 2.5f + i * 0.5f) * 2.5f;

            int pixelSize = (int)size;
            var bubbleRect = new Rectangle((int)x, (int)y, pixelSize, pixelSize);

            // Enhanced bubble with gradient effect
            using var bubbleFill = new SolidBrush(Color.FromArgb(50, 140, 200, 255));
            graphics.FillRectangle(bubbleFill, bubbleRect);

            // Enhanced highlight with glow
            using var highlight = new SolidBrush(Color.FromArgb(80, 200, 255, 255));
            graphics.FillRectangle(highlight, bubbleRect.X + 1, bubbleRect.Y + 1, 1, 1);
            
            // Add subtle outer glow
            using var glow = new SolidBrush(Color.FromArgb(30, 100, 180, 230));
            graphics.FillRectangle(glow, bubbleRect.X - 1, bubbleRect.Y - 1, pixelSize + 2, pixelSize + 2);
        }
        
        // Add larger floating bubbles
        for (int i = 0; i < 4; i++)
        {
            float t = time * 0.25f + i * 1.2f;
            float x = panel.Width * 0.2f + i * panel.Width * 0.2f + MathF.Cos(t * 0.8f + i) * 20f;
            float y = panel.Height * 0.4f + ((t * 35f) % (panel.Height * 0.5f));
            float size = 6f + MathF.Sin(t * 1.5f + i) * 3f;

            int pixelSize = (int)size;
            var bubbleRect = new Rectangle((int)x, (int)y, pixelSize, pixelSize);

            using var bubbleFill = new SolidBrush(Color.FromArgb(60, 160, 220, 255));
            graphics.FillRectangle(bubbleFill, bubbleRect);

            using var highlight = new SolidBrush(Color.FromArgb(100, 230, 255, 255));
            graphics.FillRectangle(highlight, bubbleRect.X + 1, bubbleRect.Y + 1, 2, 2);
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
        Gfx.FillRound(graphics, chip, 10, Color.FromArgb(200, 70, 140, 190), Color.FromArgb(200, 50, 110, 160));
        using var chipFont = new Font("Courier New", 7.5f, FontStyle.Bold);
        using var chipBrush = new SolidBrush(Color.White);
        Gfx.CenteredText(graphics, "LIVE", chipFont, chipBrush, chip);
        
        // Add chip glow
        using var chipGlow = new SolidBrush(Color.FromArgb(60, 100, 170, 220));
        graphics.FillRectangle(chipGlow, chip.X - 1, chip.Y - 1, chip.Width + 2, chip.Height + 2);

        DrawPixelatedDroplets(graphics, headerRect);

        var closeRect = Metrics.CloseButtonRect;
        
        // Enhanced close button with gradient and glow
        using (var closeFill = new LinearGradientBrush(
                   new Point(closeRect.Left, closeRect.Top),
                   new Point(closeRect.Left, closeRect.Bottom),
                   Color.FromArgb(255, 100, 160, 210),
                   Color.FromArgb(255, 60, 120, 170)))
        {
            closeFill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(255, 120, 180, 230),
                    Color.FromArgb(255, 100, 160, 210),
                    Color.FromArgb(255, 80, 140, 190),
                    Color.FromArgb(255, 60, 120, 170)
                ],
                Positions = [0f, 0.3f, 0.7f, 1f]
            };
            graphics.FillEllipse(closeFill, closeRect);
            
            // Add top highlight
            using var topHighlight = new SolidBrush(Color.FromArgb(100, 200, 240, 255));
            graphics.FillEllipse(topHighlight, closeRect.X + 2, closeRect.Y + 1, closeRect.Width - 4, 4);
        }
        
        using (var ring = new Pen(Color.FromArgb(230, 160, 210, 255), 2f))
        using (var ringGlow = new Pen(Color.FromArgb(120, 180, 230, 255), 1.2f))
        {
            graphics.DrawEllipse(ringGlow, closeRect);
            graphics.DrawEllipse(ring, closeRect);
        }

        using var closeX = new Pen(Color.FromArgb(255, 240, 250, 255), 2.5f)
        {
            StartCap = LineCap.Round,
            EndCap = LineCap.Round
        };
        graphics.DrawLine(closeX, closeRect.X + 6, closeRect.Y + 6, closeRect.Right - 6, closeRect.Bottom - 6);
        graphics.DrawLine(closeX, closeRect.Right - 6, closeRect.Y + 6, closeRect.X + 6, closeRect.Bottom - 6);
        
        // Add X glow
        using var closeXGlow = new Pen(Color.FromArgb(150, 200, 255, 255), 1.5f)
        {
            StartCap = LineCap.Round,
            EndCap = LineCap.Round
        };
        graphics.DrawLine(closeXGlow, closeRect.X + 6, closeRect.Y + 6, closeRect.Right - 6, closeRect.Bottom - 6);
        graphics.DrawLine(closeXGlow, closeRect.Right - 6, closeRect.Y + 6, closeRect.X + 6, closeRect.Bottom - 6);
    }

    private static void DrawPixelatedDroplets(Graphics graphics, Rectangle bounds)
    {
        using var droplet = new SolidBrush(Color.FromArgb(120, 100, 170, 230));
        using var dropletGlow = new SolidBrush(Color.FromArgb(80, 140, 210, 255));
        
        graphics.FillRectangle(dropletGlow, bounds.X + 3, bounds.Y + 1, 3, 3);
        graphics.FillRectangle(droplet, bounds.X + 4, bounds.Y + 2, 2, 2);
        
        graphics.FillRectangle(dropletGlow, bounds.X + 7, bounds.Y + 5, 2, 2);
        graphics.FillRectangle(droplet, bounds.X + 8, bounds.Y + 6, 1, 1);
        
        graphics.FillRectangle(dropletGlow, bounds.Right - 7, bounds.Y + 3, 3, 3);
        graphics.FillRectangle(droplet, bounds.Right - 6, bounds.Y + 4, 2, 2);
        
        graphics.FillRectangle(dropletGlow, bounds.Right - 11, bounds.Y + 7, 2, 2);
        graphics.FillRectangle(droplet, bounds.Right - 10, bounds.Y + 8, 1, 1);
    }

    private static void DrawPixelatedStars(Graphics graphics, Rectangle bounds)
    {
        using var star = new SolidBrush(Color.FromArgb(100, 220, 255, 255));
        using var starGlow = new SolidBrush(Color.FromArgb(70, 180, 230, 255));
        using var starDark = new SolidBrush(Color.FromArgb(80, 170, 210, 240));

        // First star with glow
        graphics.FillRectangle(starGlow, bounds.X + 129, bounds.Y + 7, 3, 3);
        graphics.FillRectangle(star, bounds.X + 130, bounds.Y + 8, 2, 2);
        graphics.FillRectangle(star, bounds.X + 132, bounds.Y + 6, 2, 2);
        graphics.FillRectangle(star, bounds.X + 134, bounds.Y + 8, 2, 2);
        graphics.FillRectangle(star, bounds.X + 132, bounds.Y + 10, 2, 2);

        // Second star with glow
        graphics.FillRectangle(starGlow, bounds.X + 141, bounds.Y + 11, 3, 3);
        graphics.FillRectangle(starDark, bounds.X + 142, bounds.Y + 12, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 144, bounds.Y + 10, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 146, bounds.Y + 12, 2, 2);
        graphics.FillRectangle(starDark, bounds.X + 144, bounds.Y + 14, 2, 2);

        // Third star with glow
        graphics.FillRectangle(starGlow, bounds.X + 151, bounds.Y + 17, 3, 3);
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
        // Enhanced track with gradient
        using var path = Gfx.RoundedRect(track, 5);
        using var trackFill = new LinearGradientBrush(track, Color.FromArgb(120, 25, 60, 95), Color.FromArgb(150, 15, 45, 75), LinearGradientMode.Vertical);
        graphics.FillPath(trackFill, path);
        
        using (var inset = new Pen(Color.FromArgb(85, 90, 150, 195), 1.5f))
        using (var insetGlow = new Pen(Color.FromArgb(60, 110, 170, 210), 0.8f))
        {
            graphics.DrawPath(insetGlow, path);
            graphics.DrawPath(inset, path);
        }

        var clip = graphics.Save();
        using (var clipPath = Gfx.RoundedRect(track, 5))
        {
            graphics.SetClip(clipPath);
            int fillWidth = Math.Max(8, (int)(track.Width * progress));
            var filled = new Rectangle(track.X, track.Y, fillWidth, track.Height);
            
            // Enhanced fill with vibrant gradient
            using var fill = new LinearGradientBrush(filled, Color.FromArgb(255, 100, 170, 230), Color.FromArgb(255, 60, 120, 180), LinearGradientMode.Vertical);
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(255, 120, 190, 255),
                    Color.FromArgb(255, 100, 170, 230),
                    Color.FromArgb(255, 80, 150, 210),
                    Color.FromArgb(255, 60, 120, 180)
                ],
                Positions = [0f, 0.3f, 0.7f, 1f]
            };
            graphics.FillRectangle(fill, filled);
            
            // Enhanced shine effect
            using var shine = new LinearGradientBrush(
                filled,
                Color.FromArgb(180, 150, 200, 255),
                Color.FromArgb(40, 100, 160, 200),
                LinearGradientMode.Vertical);
            graphics.FillRectangle(shine, filled.X, filled.Y, filled.Width, 6);
            
            // Top highlight stripe
            using var topHighlight = new SolidBrush(Color.FromArgb(120, 220, 255, 255));
            graphics.FillRectangle(topHighlight, filled.X, filled.Y, filled.Width, 2);

            // Enhanced tip with glow
            using var tip = new SolidBrush(Color.FromArgb(140, 160, 210, 255));
            graphics.FillEllipse(tip, filled.Right - 10, filled.Y - 2, 11, filled.Height + 4);
            
            using var tipGlow = new SolidBrush(Color.FromArgb(80, 140, 200, 255));
            graphics.FillEllipse(tipGlow, filled.Right - 8, filled.Y - 1, 9, filled.Height + 2);
        }

        graphics.Restore(clip);
    }

    private static void DrawBasicFish(Graphics graphics, float time)
    {
        var card = new Rectangle(10, 132, Metrics.TankWidth - 20, 56);
        Gfx.GlassCard(graphics, card, 14);

        var iconWell = new Rectangle(18, 142, 34, 34);
        Gfx.InsetWell(graphics, iconWell, 10);
        Sprites.Fish(graphics, 35, 159, true, Color.FromArgb(255, 255, 168, 64), Color.FromArgb(255, 230, 110, 40), time, 0.4f, 0.5f);

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
        using var water = new SolidBrush(Color.FromArgb(60, 100, 170, 230));
        using var waterGlow = new SolidBrush(Color.FromArgb(40, 140, 210, 255));
        
        graphics.FillRectangle(waterGlow, bounds.Right + 1, bounds.Y + 3, 3, 3);
        graphics.FillRectangle(water, bounds.Right + 2, bounds.Y + 4, 2, 2);
        
        graphics.FillRectangle(waterGlow, bounds.Right + 3, bounds.Y + 7, 2, 2);
        graphics.FillRectangle(water, bounds.Right + 4, bounds.Y + 8, 1, 1);
        
        graphics.FillRectangle(waterGlow, bounds.X - 3, bounds.Bottom - 7, 3, 3);
        graphics.FillRectangle(water, bounds.X - 2, bounds.Bottom - 6, 2, 2);
        
        graphics.FillRectangle(waterGlow, bounds.X - 5, bounds.Bottom - 11, 2, 2);
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
            Color.FromArgb(255, 100, 160, 220),
            Color.FromArgb(255, 110, 170, 230),
            Color.FromArgb(255, 120, 180, 240),
            Color.FromArgb(255, 110, 170, 230),
            Color.FromArgb(255, 100, 160, 220),
            Color.FromArgb(255, 110, 170, 230)
        ];

        for (int i = 0; i < 6; i++)
        {
            var iconRect = new Rectangle(startX + i * (iconSize + spacing), y, iconSize, iconSize);
            bool selected = i == 0;
            
            if (selected)
            {
                // Enhanced glow effect for selected item
                using var glowOuter = new SolidBrush(Color.FromArgb(100, 140, 200, 255));
                graphics.FillRectangle(glowOuter, Rectangle.Inflate(iconRect, 8, 8));
                
                using var glowInner = new SolidBrush(Color.FromArgb(80, 160, 220, 255));
                graphics.FillRectangle(glowInner, Rectangle.Inflate(iconRect, 5, 5));
            }

            // Enhanced gradient fill with multi-stop interpolation
            using (var path = Gfx.RoundedRect(iconRect, 9))
            using (var fill = new LinearGradientBrush(
                       new Point(iconRect.Left, iconRect.Top),
                       new Point(iconRect.Left, iconRect.Bottom),
                       selected ? Color.FromArgb(255, 160, 210, 255) : ControlPaint.Light(colors[i]),
                       colors[i]))
            {
                fill.InterpolationColors = new ColorBlend
                {
                    Colors =
                    [
                        selected ? Color.FromArgb(255, 180, 230, 255) : ControlPaint.LightLight(colors[i]),
                        selected ? Color.FromArgb(255, 160, 210, 255) : ControlPaint.Light(colors[i]),
                        selected ? Color.FromArgb(255, 130, 190, 245) : colors[i],
                        selected ? Color.FromArgb(255, 110, 170, 235) : Color.FromArgb(255, colors[i].R - 20, colors[i].G - 20, colors[i].B - 20)
                    ],
                    Positions = [0f, 0.3f, 0.7f, 1f]
                };
                graphics.FillPath(fill, path);
                
                // Add top highlight
                using var topHighlight = new SolidBrush(Color.FromArgb(150, 230, 255, 255));
                graphics.FillRectangle(topHighlight, iconRect.X + 3, iconRect.Y + 1, iconRect.Width - 6, 3);
                
                // Enhanced outer ring with glow
                using var ring = new Pen(selected ? Color.FromArgb(255, 150, 210, 255) : Color.FromArgb(255, 100, 160, 220), selected ? 3f : 2.5f);
                graphics.DrawPath(ring, path);
                
                using var ringGlow = new Pen(selected ? Color.FromArgb(120, 180, 240, 255) : Color.FromArgb(80, 140, 200, 255), 1.5f);
                graphics.DrawPath(ringGlow, path);

                if (selected)
                {
                    // Enhanced inner ring for selected state
                    using var innerRing = new Pen(Color.FromArgb(120, 160, 210, 250), 1.2f);
                    using var innerPath = Gfx.RoundedRect(Rectangle.Inflate(iconRect, -3, -3), 7);
                    graphics.DrawPath(innerRing, innerPath);
                    
                    // Add center glow
                    using var centerGlow = new SolidBrush(Color.FromArgb(60, 180, 230, 255));
                    graphics.FillEllipse(centerGlow, iconRect.X + iconRect.Width / 2 - 4, iconRect.Y + iconRect.Height / 2 - 4, 8, 8);
                }
            }

            Sprites.NavGlyph(graphics, iconRect, i);
        }
    }

    private static void DrawPixelatedWaves(Graphics graphics, Rectangle bounds)
    {
        using var wave = new SolidBrush(Color.FromArgb(50, 80, 130, 180));
        using var waveGlow = new SolidBrush(Color.FromArgb(35, 110, 170, 220));
        
        for (int i = 0; i < bounds.Width; i += 6)
        {
            int waveHeight = 2 + (i % 5);
            // Add glow behind
            graphics.FillRectangle(waveGlow, bounds.X + i - 1, bounds.Bottom - waveHeight - 1, 5, waveHeight + 2);
            // Main wave
            graphics.FillRectangle(wave, bounds.X + i, bounds.Bottom - waveHeight, 4, waveHeight);
        }
        
        // Add occasional larger wave peaks
        for (int i = 12; i < bounds.Width; i += 24)
        {
            int waveHeight = 4 + (i % 3);
            graphics.FillRectangle(waveGlow, bounds.X + i - 1, bounds.Bottom - waveHeight - 1, 6, waveHeight + 2);
            graphics.FillRectangle(wave, bounds.X + i, bounds.Bottom - waveHeight, 5, waveHeight);
        }
    }

    private static void DrawPixelatedSeaweed(Graphics graphics, Rectangle panel, float time)
    {
        var clip = graphics.Save();
        using var path = Gfx.RoundedTopRect(panel, 18);
        graphics.SetClip(path);

        using var seaweed = new SolidBrush(Color.FromArgb(70, 80, 160, 110));
        using var seaweedLight = new SolidBrush(Color.FromArgb(60, 100, 180, 130));
        using var seaweedDark = new SolidBrush(Color.FromArgb(60, 50, 120, 90));

        for (int i = 0; i < 3; i++)
        {
            float sway = MathF.Sin(time * 0.6f + i * 1.6f) * 4f;
            int x = 15 + i * 8;
            int height = 65 + i * 22;

            // Main seaweed strands with enhanced colors
            graphics.FillRectangle(seaweedLight, x, panel.Height - height, 4, height);
            graphics.FillRectangle(seaweed, x + 4, panel.Height - height + 12, 3, height - 12);
            graphics.FillRectangle(seaweed, x - 2, panel.Height - height + 24, 3, height - 24);

            // Enhanced detail strands with more animation
            graphics.FillRectangle(seaweedDark, x + 5, panel.Height - height + 35 + (int)sway, 6, 4);
            graphics.FillRectangle(seaweedDark, x - 3, panel.Height - height + 55 - (int)sway, 5, 3);
            
            // Add glow effect
            graphics.FillRectangle(seaweedLight, x + 1, panel.Height - height + 2, 2, height - 4);
        }

        for (int i = 0; i < 3; i++)
        {
            float sway = MathF.Sin(time * 0.6f + i * 1.6f + 2.2f) * 4f;
            int x = panel.Width - 25 - i * 8;
            int height = 55 + i * 18;

            graphics.FillRectangle(seaweedLight, x, panel.Height - height, 4, height);
            graphics.FillRectangle(seaweed, x - 4, panel.Height - height + 12, 3, height - 12);
            graphics.FillRectangle(seaweed, x + 2, panel.Height - height + 24, 3, height - 24);

            graphics.FillRectangle(seaweedDark, x - 5, panel.Height - height + 30 + (int)sway, 6, 4);
            graphics.FillRectangle(seaweedDark, x + 3, panel.Height - height + 50 - (int)sway, 5, 3);
            
            // Add glow effect
            graphics.FillRectangle(seaweedLight, x + 1, panel.Height - height + 2, 2, height - 4);
        }

        graphics.Restore(clip);
    }
}
