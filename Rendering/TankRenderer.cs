using System.Drawing.Drawing2D;
using AquariumTaskbar.Drawing;
using AquariumTaskbar.Entities;
using AquariumTaskbar.Scene;

namespace AquariumTaskbar.Rendering;

internal static class TankRenderer
{
    public static void Draw(Graphics graphics, int top, Aquarium aquarium)
    {
        int left = 0;
        int right = Metrics.TankWidth - 1;
        int backY = top;
        int frontTop = top + Metrics.LidDepth;
        int frontBottom = top + Metrics.LidDepth + Metrics.TankHeight - 1;

        var backLeft = new Point(left + Metrics.LidInset, backY);
        var backRight = new Point(right - Metrics.LidInset, backY);
        var frontTopLeft = new Point(left, frontTop);
        var frontTopRight = new Point(right, frontTop);
        var frontBottomLeft = new Point(left, frontBottom);
        var frontBottomRight = new Point(right, frontBottom);

        var innerBackLeft = new Point(left + Metrics.LidInset + Metrics.GlassThickness, backY + Metrics.GlassThickness);
        var innerBackRight = new Point(right - Metrics.LidInset - Metrics.GlassThickness, backY + Metrics.GlassThickness);
        var innerSeamLeft = new Point(left + Metrics.GlassThickness, frontTop);
        var innerSeamRight = new Point(right - Metrics.GlassThickness, frontTop);

        var frontWater = Rectangle.FromLTRB(
            left + Metrics.GlassThickness,
            frontTop,
            right - Metrics.GlassThickness + 1,
            frontBottom - Metrics.BottomThickness + 1);

        DrawFrontScene(graphics, frontWater, aquarium);
        DrawGlassFrame(
            graphics,
            left,
            right,
            frontTop,
            frontBottom,
            backLeft,
            backRight,
            frontTopLeft,
            frontTopRight,
            frontBottomLeft,
            frontBottomRight,
            innerBackLeft,
            innerBackRight,
            innerSeamLeft,
            innerSeamRight,
            frontWater);
    }

    private static void DrawFrontScene(Graphics graphics, Rectangle water, Aquarium aquarium)
    {
        var state = graphics.Save();
        graphics.SetClip(water);

        using (var fill = new LinearGradientBrush(
                   water,
                   Color.FromArgb(245, 60, 130, 180),
                   Color.FromArgb(255, 20, 50, 90),
                   LinearGradientMode.Vertical))
        {
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(248, 80, 150, 200),
                    Color.FromArgb(245, 50, 110, 170),
                    Color.FromArgb(242, 35, 85, 140),
                    Color.FromArgb(240, 25, 70, 120),
                    Color.FromArgb(255, 15, 40, 80)
                ],
                Positions = [0f, 0.25f, 0.5f, 0.75f, 1f]
            };
            graphics.FillRectangle(fill, water);
        }

        DrawLightRays(graphics, water, aquarium.Time);
        DrawCaustics(graphics, water, aquarium.Time);
        DrawPlants(graphics, water, aquarium.Time);
        DrawSand(graphics, water);
        DrawFishSchool(graphics, water, aquarium);
        DrawBubbles(graphics, water, aquarium.Bubbles);
        DrawSurface(graphics, water, aquarium.Time);
        DrawGlassGlare(graphics, water);

        graphics.Restore(state);
    }

    private static void DrawLightRays(Graphics graphics, Rectangle water, float time)
    {
        var clip = graphics.Save();
        graphics.SetClip(water);

        using var rayBrush = new LinearGradientBrush(
            water,
            Color.FromArgb(60, 150, 200, 255),
            Color.FromArgb(10, 100, 150, 200),
            LinearGradientMode.Vertical);

        for (int i = 0; i < 5; i++)
        {
            float offset = MathF.Sin(time * 0.3f + i * 1.2f) * 8f;
            float x = water.Left + water.Width * (0.2f + i * 0.15f) + offset;
            float width = 15 + MathF.Sin(time * 0.5f + i) * 5f;
            
            var rayRect = new RectangleF(x, water.Top, width, water.Height);
            graphics.FillRectangle(rayBrush, rayRect);
        }

        graphics.Restore(clip);
    }

    private static void DrawCaustics(Graphics graphics, Rectangle water, float time)
    {
        using var pen = new Pen(Color.FromArgb(180, 90, 150, 210), 2.5f);
        for (int band = 0; band < 4; band++)
        {
            int y = water.Top + 15 + band * 25;
            var points = new PointF[10];
            for (int i = 0; i < points.Length; i++)
            {
                float x = water.Left + i * (water.Width / 9f);
                float wave = MathF.Sin(time * 1.8f + i * 1.1f + band * 0.8f) * 4.5f;
                float secondaryWave = MathF.Cos(time * 1.2f + i * 0.7f + band) * 2f;
                points[i] = new PointF(x, y + wave + secondaryWave);
            }

            graphics.DrawLines(pen, points);
        }

        // Add smaller detail caustics
        using var detailPen = new Pen(Color.FromArgb(120, 70, 130, 180), 1.5f);
        for (int band = 0; band < 6; band++)
        {
            int y = water.Top + 25 + band * 18;
            var points = new PointF[6];
            for (int i = 0; i < points.Length; i++)
            {
                float x = water.Left + i * (water.Width / 5f) + (band % 2) * 15f;
                float wave = MathF.Sin(time * 2.2f + i * 1.4f + band * 1.2f) * 2.5f;
                points[i] = new PointF(x, y + wave);
            }

            graphics.DrawLines(detailPen, points);
        }
    }

    private static void DrawPlants(Graphics graphics, Rectangle water, float time)
    {
        DrawSeaweed(graphics, water, water.Left + 18, 38, Color.FromArgb(160, 40, 140, 95), 1.1f, time);
        DrawSeaweed(graphics, water, water.Left + 32, 32, Color.FromArgb(150, 25, 120, 78), 0.7f, time);
        DrawSeaweed(graphics, water, water.Right - 45, 36, Color.FromArgb(155, 45, 145, 98), 1.4f, time);
        DrawSeaweed(graphics, water, water.Right - 28, 30, Color.FromArgb(145, 20, 110, 70), 0.4f, time);
        DrawSeaweed(graphics, water, water.Left + 80, 28, Color.FromArgb(150, 35, 125, 85), 0.9f, time);
        DrawSeaweed(graphics, water, water.Right - 85, 26, Color.FromArgb(148, 30, 118, 82), 1.2f, time);
    }

    private static void DrawSeaweed(Graphics graphics, Rectangle water, int x, int height, Color color, float phase, float time)
    {
        int sand = water.Bottom - 10;
        var points = new PointF[7];
        for (int i = 0; i < points.Length; i++)
        {
            float t = i / 6f;
            float sway = MathF.Sin(time * 1.5f + phase + t * 2.5f) * (5f + t * 6f);
            float secondarySway = MathF.Cos(time * 1.2f + phase * 1.3f + t * 1.8f) * 2f;
            points[i] = new PointF(x + sway + secondarySway, sand - height * t);
        }

        using var brush = new SolidBrush(color);
        using var leafBrush = new SolidBrush(Color.FromArgb(color.A + 20, color.R + 20, color.G + 30, color.B + 25));
        
        for (int i = 0; i < points.Length - 1; i++)
        {
            int width = 5;
            int rectY = (int)Math.Min(points[i].Y, points[i + 1].Y);
            int rectHeight = (int)Math.Abs(points[i].Y - points[i + 1].Y) + 2;
            graphics.FillRectangle(brush, (int)points[i].X - width/2, rectY, width, rectHeight);
            
            // Add leaf details every other segment
            if (i % 2 == 0 && i > 0)
            {
                int leafX = (int)points[i].X + width;
                int leafY = rectY + rectHeight / 2;
                graphics.FillRectangle(leafBrush, leafX, leafY - 3, 4, 6);
                graphics.FillRectangle(leafBrush, leafX - 8, leafY - 2, 4, 5);
            }
        }
    }

    private static void DrawSand(Graphics graphics, Rectangle water)
    {
        int sandHeight = 16;
        int sandTop = water.Bottom - sandHeight;
        var sandRect = new Rectangle(water.Left, sandTop, water.Width, sandHeight);

        // Main sand base with gradient
        using var sand = new LinearGradientBrush(
            sandRect,
            Color.FromArgb(235, 210, 170, 110),
            Color.FromArgb(220, 190, 150, 90),
            LinearGradientMode.Vertical);
        graphics.FillRectangle(sand, sandRect);

        // Add more detailed texture
        using var sandDark = new SolidBrush(Color.FromArgb(200, 180, 140, 80));
        using var sandLight = new SolidBrush(Color.FromArgb(180, 220, 190, 130));
        
        for (int i = 0; i < water.Width; i += 6)
        {
            int textureHeight = 2 + (i % 4);
            int xOffset = (i % 3) * 2;
            graphics.FillRectangle(sandDark, water.Left + i + xOffset, sandTop + textureHeight, 3, textureHeight);
            
            if (i % 2 == 0)
            {
                graphics.FillRectangle(sandLight, water.Left + i + 2, sandTop + sandHeight - 3, 2, 2);
            }
        }

        // Add more pebbles and rocks
        using var pebble = new SolidBrush(Color.FromArgb(180, 160, 120, 80));
        using var pebbleDark = new SolidBrush(Color.FromArgb(160, 140, 100, 70));
        using var pebbleHi = new SolidBrush(Color.FromArgb(150, 220, 240, 255));
        
        // Pebble group 1
        graphics.FillRectangle(pebble, water.Left + 40, sandTop + 4, 8, 5);
        graphics.FillRectangle(pebbleDark, water.Left + 42, sandTop + 6, 4, 3);
        graphics.FillRectangle(pebbleHi, water.Left + 42, sandTop + 4, 2, 2);
        
        // Pebble group 2
        graphics.FillRectangle(pebble, water.Left + 95, sandTop + 6, 7, 4);
        graphics.FillRectangle(pebbleDark, water.Left + 97, sandTop + 7, 3, 3);
        graphics.FillRectangle(pebbleHi, water.Left + 97, sandTop + 6, 2, 1);
        
        // Pebble group 3
        graphics.FillRectangle(pebble, water.Left + 148, sandTop + 5, 9, 5);
        graphics.FillRectangle(pebbleDark, water.Left + 150, sandTop + 7, 5, 3);
        graphics.FillRectangle(pebbleHi, water.Left + 150, sandTop + 5, 3, 2);
        
        // Pebble group 4
        graphics.FillRectangle(pebble, water.Right - 70, sandTop + 6, 6, 4);
        graphics.FillRectangle(pebbleDark, water.Right - 68, sandTop + 7, 3, 3);
        graphics.FillRectangle(pebbleHi, water.Right - 68, sandTop + 6, 2, 2);
        
        // Pebble group 5
        graphics.FillRectangle(pebble, water.Right - 35, sandTop + 4, 7, 5);
        graphics.FillRectangle(pebbleDark, water.Right - 33, sandTop + 6, 4, 3);
        graphics.FillRectangle(pebbleHi, water.Right - 33, sandTop + 4, 2, 2);
        
        // Small shell fragments
        using var shell = new SolidBrush(Color.FromArgb(170, 240, 230, 200));
        graphics.FillRectangle(shell, water.Left + 65, sandTop + 8, 3, 2);
        graphics.FillRectangle(shell, water.Left + 180, sandTop + 7, 2, 2);
        graphics.FillRectangle(shell, water.Right - 50, sandTop + 9, 3, 2);
    }

    private static void DrawFishSchool(Graphics graphics, Rectangle water, Aquarium aquarium)
    {
        foreach (var fish in aquarium.Fish)
        {
            float y = fish.Y + MathF.Sin(aquarium.Time * fish.BobSpeed + fish.Phase) * fish.Bob;
            Sprites.Fish(graphics, water.Left + fish.X, water.Top + y, fish.FacingRight, fish.Body, fish.Fin);
        }
    }

    private static void DrawBubbles(Graphics graphics, Rectangle water, List<Bubble> bubbles)
    {
        foreach (var bubble in bubbles)
        {
            int x = water.Left + (int)bubble.X;
            int y = water.Top + (int)bubble.Y;
            int size = bubble.Size;
            
            // Enhanced bubble rendering with better gradients and highlights
            using (var fill = new LinearGradientBrush(
                       new Rectangle(x, y, size, size),
                       Color.FromArgb(100, 130, 180, 220),
                       Color.FromArgb(30, 80, 130, 170),
                       LinearGradientMode.ForwardDiagonal))
            {
                graphics.FillEllipse(fill, x, y, size, size);
            }

            // Outer rim
            using var rim = new Pen(Color.FromArgb(160, 90, 160, 200), 1.2f);
            graphics.DrawEllipse(rim, x, y, size, size);

            // Multiple highlights for more realistic look
            int highlightSize = Math.Max(2, size / 3);
            graphics.FillRectangle(Brushes.White, x + size / 4, y + size / 6, highlightSize, Math.Max(2, size / 4));
            
            if (size > 3)
            {
                graphics.FillRectangle(Brushes.White, x + size / 2, y + size / 3, 1, 1);
                
                // Secondary highlight
                using var secondaryHighlight = new SolidBrush(Color.FromArgb(180, 200, 230, 255));
                graphics.FillRectangle(secondaryHighlight, x + size / 3, y + size / 2, 1, 1);
            }
            
            // Inner glow for larger bubbles
            if (size > 5)
            {
                using var innerGlow = new SolidBrush(Color.FromArgb(40, 150, 200, 255));
                graphics.FillEllipse(innerGlow, x + size / 3, y + size / 3, size / 3, size / 3);
            }
        }
    }

    private static void DrawSurface(Graphics graphics, Rectangle water, float time)
    {
        using var surface = new SolidBrush(Color.FromArgb(200, 50, 100, 150));
        graphics.FillRectangle(surface, water.Left, water.Top, water.Width, 4);

        using var wave = new SolidBrush(Color.FromArgb(180, 70, 120, 170));
        for (int i = 0; i < water.Width; i += 6)
        {
            int waveHeight = 2 + (int)(MathF.Sin(time * 2f + i) * 1.4f);
            graphics.FillRectangle(wave, water.Left + i, water.Top + 2, 4, waveHeight);
        }
    }

    private static void DrawGlassGlare(Graphics graphics, Rectangle water)
    {
        // Main left glare with gradient
        using var glareBrush = new LinearGradientBrush(
            new Rectangle(water.Left, water.Top, 12, water.Height),
            Color.FromArgb(120, 100, 160, 220),
            Color.FromArgb(60, 80, 140, 190),
            LinearGradientMode.Horizontal);
        
        for (int i = 0; i < water.Height; i += 6)
        {
            int glareWidth = 10 + (i % 5);
            int glareAlpha = 120 - (i / water.Height) * 40;
            using var glare = new SolidBrush(Color.FromArgb(glareAlpha, 90, 140, 200));
            graphics.FillRectangle(glare, water.Left, water.Top + i, glareWidth, 4);
        }

        // Right edge shade with more depth
        using var edgeShadeBrush = new LinearGradientBrush(
            new Rectangle(water.Right - 10, water.Top, 10, water.Height),
            Color.FromArgb(80, 50, 90, 140),
            Color.FromArgb(40, 30, 60, 100),
            LinearGradientMode.Horizontal);
        
        for (int i = 0; i < water.Height; i += 5)
        {
            int shadeWidth = 8 + (i % 4);
            int shadeAlpha = 150 - (i / water.Height) * 50;
            using var edgeShade = new SolidBrush(Color.FromArgb(shadeAlpha, 40, 70, 120));
            graphics.FillRectangle(edgeShade, water.Right - shadeWidth, water.Top + i, shadeWidth, 4);
        }

        // Add diagonal light reflection
        using var diagonalReflection = new LinearGradientBrush(
            new PointF(water.Left + water.Width * 0.3f, water.Top),
            new PointF(water.Left + water.Width * 0.7f, water.Bottom),
            Color.FromArgb(40, 120, 180, 240),
            Color.FromArgb(10, 80, 140, 200));
        
        var reflectionRect = new Rectangle(
            water.Left + (int)(water.Width * 0.25f),
            water.Top + 10,
            (int)(water.Width * 0.5f),
            water.Height - 20);
        
        graphics.FillRectangle(diagonalReflection, reflectionRect);

        // Add subtle horizontal streaks
        using var streakBrush = new SolidBrush(Color.FromArgb(30, 100, 160, 220));
        for (int i = 0; i < 3; i++)
        {
            int y = water.Top + 20 + i * 30;
            int streakWidth = (int)(water.Width * 0.6f);
            int x = water.Left + (int)(water.Width * 0.2f);
            graphics.FillRectangle(streakBrush, x, y, streakWidth, 2);
        }
    }

    private static void DrawGlassFrame(
        Graphics graphics,
        int left,
        int right,
        int frontTop,
        int frontBottom,
        Point backLeft,
        Point backRight,
        Point frontTopLeft,
        Point frontTopRight,
        Point frontBottomLeft,
        Point frontBottomRight,
        Point innerBackLeft,
        Point innerBackRight,
        Point innerSeamLeft,
        Point innerSeamRight,
        Rectangle frontWater)
    {
        int pillarHeight = frontBottom - Metrics.BottomThickness - frontTop + 1;

        using var backWater = new SolidBrush(Color.FromArgb(200, 40, 90, 140));
        graphics.FillPolygon(backWater, [backLeft, backRight, innerBackRight, innerBackLeft]);

        using var leftLid = new SolidBrush(Color.FromArgb(220, 60, 110, 160));
        graphics.FillPolygon(leftLid, [backLeft, frontTopLeft, innerSeamLeft, innerBackLeft]);

        using var rightLid = new SolidBrush(Color.FromArgb(200, 50, 100, 150));
        graphics.FillPolygon(rightLid, [backRight, frontTopRight, innerSeamRight, innerBackRight]);

        using var leftPillar = new SolidBrush(Color.FromArgb(230, 70, 120, 170));
        graphics.FillRectangle(leftPillar, left, frontTop, Metrics.GlassThickness, pillarHeight);

        using var rightPillar = new SolidBrush(Color.FromArgb(210, 60, 110, 160));
        graphics.FillRectangle(rightPillar, right - Metrics.GlassThickness, frontTop, Metrics.GlassThickness + 1, pillarHeight);

        using var baseFill = new SolidBrush(Color.FromArgb(220, 70, 120, 170));
        graphics.FillRectangle(baseFill, left, frontBottom - Metrics.BottomThickness, right - left + 1, Metrics.BottomThickness);

        using var highlight = new SolidBrush(Color.FromArgb(200, 100, 160, 210));
        graphics.FillRectangle(
            highlight,
            left + Metrics.GlassThickness,
            frontBottom - Metrics.BottomThickness,
            right - left - 2 * Metrics.GlassThickness,
            2);

        using var outer = new Pen(Color.FromArgb(255, 100, 160, 220), 2f);
        graphics.DrawPolygon(outer, [
            backLeft, backRight, frontTopRight, frontBottomRight, frontBottomLeft, frontTopLeft
        ]);

        using var inner = new Pen(Color.FromArgb(200, 80, 140, 190), 2f);
        graphics.DrawPolygon(inner, [innerBackLeft, innerBackRight, innerSeamRight, innerSeamLeft]);
        graphics.DrawLine(inner, innerSeamLeft, new Point(frontWater.Left, frontWater.Bottom - 1));
        graphics.DrawLine(inner, innerSeamRight, new Point(frontWater.Right - 1, frontWater.Bottom - 1));
        graphics.DrawLine(
            inner,
            new Point(frontWater.Left, frontWater.Bottom - 1),
            new Point(frontWater.Right - 1, frontWater.Bottom - 1));

        using var cornerHighlight = new SolidBrush(Color.FromArgb(220, 120, 180, 230));
        graphics.FillRectangle(cornerHighlight, frontTopLeft.X + 1, frontTopLeft.Y + 1, 4, 1);
        graphics.FillRectangle(cornerHighlight, frontTopLeft.X + 1, frontTopLeft.Y + 1, 1, 4);
    }
}
