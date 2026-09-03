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
                   Color.FromArgb(240, 30, 90, 150),
                   Color.FromArgb(255, 15, 50, 100),
                   LinearGradientMode.Vertical))
        {
            fill.InterpolationColors = new ColorBlend
            {
                Colors =
                [
                    Color.FromArgb(240, 50, 110, 170),
                    Color.FromArgb(240, 25, 80, 130),
                    Color.FromArgb(255, 10, 40, 80)
                ],
                Positions = [0f, 0.45f, 1f]
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
    }

    private static void DrawCaustics(Graphics graphics, Rectangle water, float time)
    {
        using var pen = new Pen(Color.FromArgb(150, 60, 120, 170), 2f);
        for (int band = 0; band < 3; band++)
        {
            int y = water.Top + 18 + band * 22;
            var points = new PointF[8];
            for (int i = 0; i < points.Length; i++)
            {
                float x = water.Left + i * (water.Width / 7f);
                float wave = MathF.Sin(time * 1.4f + i * 0.9f + band) * 3.2f;
                points[i] = new PointF(x, y + wave);
            }

            graphics.DrawLines(pen, points);
        }
    }

    private static void DrawPlants(Graphics graphics, Rectangle water, float time)
    {
        DrawSeaweed(graphics, water, water.Left + 18, 34, Color.FromArgb(160, 36, 128, 88), 1.1f, time);
        DrawSeaweed(graphics, water, water.Left + 32, 28, Color.FromArgb(150, 22, 108, 72), 0.7f, time);
        DrawSeaweed(graphics, water, water.Right - 40, 32, Color.FromArgb(155, 40, 132, 90), 1.4f, time);
        DrawSeaweed(graphics, water, water.Right - 24, 26, Color.FromArgb(145, 18, 96, 64), 0.4f, time);
    }

    private static void DrawSeaweed(Graphics graphics, Rectangle water, int x, int height, Color color, float phase, float time)
    {
        int sand = water.Bottom - 10;
        var points = new PointF[5];
        for (int i = 0; i < points.Length; i++)
        {
            float t = i / 4f;
            float sway = MathF.Sin(time * 1.3f + phase + t * 2.2f) * (4f + t * 5f);
            points[i] = new PointF(x + sway, sand - height * t);
        }

        using var brush = new SolidBrush(color);
        for (int i = 0; i < points.Length - 1; i++)
        {
            int width = 4;
            int rectY = (int)Math.Min(points[i].Y, points[i + 1].Y);
            int rectHeight = (int)Math.Abs(points[i].Y - points[i + 1].Y) + 2;
            graphics.FillRectangle(brush, (int)points[i].X - width/2, rectY, width, rectHeight);
        }
    }

    private static void DrawSand(Graphics graphics, Rectangle water)
    {
        int sandHeight = 14;
        int sandTop = water.Bottom - sandHeight;
        var sandRect = new Rectangle(water.Left, sandTop, water.Width, sandHeight);

        using var sand = new SolidBrush(Color.FromArgb(220, 200, 160, 100));
        graphics.FillRectangle(sand, sandRect);

        using var sandDark = new SolidBrush(Color.FromArgb(200, 180, 140, 80));
        for (int i = 0; i < water.Width; i += 8)
        {
            int textureHeight = 2 + (i % 3);
            graphics.FillRectangle(sandDark, water.Left + i, sandTop + textureHeight, 4, textureHeight);
        }

        using var pebble = new SolidBrush(Color.FromArgb(180, 160, 120, 80));
        graphics.FillRectangle(pebble, water.Left + 54, sandTop + 5, 7, 4);
        graphics.FillRectangle(pebble, water.Left + 148, sandTop + 7, 9, 5);
        graphics.FillRectangle(pebble, water.Right - 70, sandTop + 6, 6, 4);
        using var pebbleHi = new SolidBrush(Color.FromArgb(150, 220, 240, 255));
        graphics.FillRectangle(pebbleHi, water.Left + 56, sandTop + 5, 3, 2);
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
            Sprites.Bubble(graphics, water.Left + (int)bubble.X, water.Top + (int)bubble.Y, bubble.Size);
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
        using var glare = new SolidBrush(Color.FromArgb(150, 70, 120, 170));
        for (int i = 0; i < water.Height; i += 8)
        {
            int glareWidth = 8 + (i % 4);
            graphics.FillRectangle(glare, water.Left, water.Top + i, glareWidth, 4);
        }

        using var edgeShade = new SolidBrush(Color.FromArgb(180, 30, 50, 80));
        for (int i = 0; i < water.Height; i += 6)
        {
            int shadeWidth = 6 + (i % 3);
            graphics.FillRectangle(edgeShade, water.Right - shadeWidth, water.Top + i, shadeWidth, 4);
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
