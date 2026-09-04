namespace AquariumTaskbar.Rendering;

internal sealed class SpriteClip
{
    public int PixelSize { get; }
    public float FrameDuration { get; }
    public float SpeedInfluence { get; }
    public string[][] Frames { get; }
    public int Width { get; }
    public int Height { get; }

    private SpriteClip(int pixelSize, float frameDuration, float speedInfluence, string[][] frames, int width, int height)
    {
        PixelSize = pixelSize;
        FrameDuration = frameDuration;
        SpeedInfluence = speedInfluence;
        Frames = frames;
        Width = width;
        Height = height;
    }

    public static SpriteClip FromRows(int pixelSize, float frameDuration, float speedInfluence, string[][] frames)
    {
        int width = 1;
        int height = 1;
        foreach (var frame in frames)
        {
            height = Math.Max(height, frame.Length);
            foreach (var row in frame)
            {
                width = Math.Max(width, row.Length);
            }
        }

        var padded = new string[frames.Length][];
        for (int f = 0; f < frames.Length; f++)
        {
            padded[f] = new string[height];
            for (int y = 0; y < height; y++)
            {
                string row = y < frames[f].Length ? frames[f][y] : string.Empty;
                padded[f][y] = row.PadRight(width, '.');
            }
        }

        return new SpriteClip(pixelSize, frameDuration, speedInfluence, padded, width, height);
    }

    public int FrameAt(float time, float phase, float speed)
    {
        int count = Frames.Length;
        float tempo = Math.Clamp(0.7f + speed * SpeedInfluence, 0.6f, 1.8f);
        float duration = FrameDuration / tempo;
        int frame = (int)MathF.Floor((time + phase) / duration) % count;
        return frame < 0 ? frame + count : frame;
    }
}

internal readonly struct FishPalette
{
    public FishPalette(Color body, Color fin)
    {
        Outline = Color.FromArgb(255, (int)(body.R * 0.16f), (int)(body.G * 0.12f), (int)(body.B * 0.1f));
        Body = body;
        BodyDark = Mix(body, Color.Black, 0.28f);
        Belly = Mix(body, Color.White, 0.4f);
        Fin = fin;
        FinDark = Mix(fin, Color.Black, 0.32f);
        EyeWhite = Color.FromArgb(255, 250, 248, 235);
        Pupil = Color.FromArgb(255, 20, 16, 18);
        Shine = Color.FromArgb(255, 255, 255, 255);
        Mouth = Mix(body, Color.FromArgb(255, 90, 30, 40), 0.45f);
        Shadow = Color.FromArgb(55, 8, 16, 32);
    }

    public Color Outline { get; }
    public Color Body { get; }
    public Color BodyDark { get; }
    public Color Belly { get; }
    public Color Fin { get; }
    public Color FinDark { get; }
    public Color EyeWhite { get; }
    public Color Pupil { get; }
    public Color Shine { get; }
    public Color Mouth { get; }
    public Color Shadow { get; }

    private static Color Mix(Color a, Color b, float t)
    {
        t = Math.Clamp(t, 0f, 1f);
        return Color.FromArgb(
            255,
            (int)(a.R + (b.R - a.R) * t),
            (int)(a.G + (b.G - a.G) * t),
            (int)(a.B + (b.B - a.B) * t));
    }
}

internal static class AnimationConfig
{
    // 28x9 sprite, facing right. Body columns stay fixed; only tail / fins change.
    // . empty  # outline  d dark  b body  l belly  f fin  n fin dark
    // W eye  E pupil  m mouth
    public static readonly SpriteClip FishSwim = SpriteClip.FromRows(
        pixelSize: 2,
        frameDuration: 0.14f,
        speedInfluence: 0.85f,
        frames:
        [
            [
                ".............nfn............",
                ".##........##bbbb##.........",
                "#ff#.....#dlbbbbbbld#.......",
                "##ff##...#llbbWWbbbb#.......",
                "#nn#.....#lbbbbWEbbb#m......",
                ".##......#dbbbbbbbbb#.......",
                "..........#lbbbbbbbd#...n...",
                "...........##bbbb##....nfn..",
                ".........................n.."
            ],
            [
                "..............fff...........",
                " .##.......##bbbb##.........",
                " #ff#....#dlbbbbbbld#.......",
                " #fff#...#llbbWWbbbb#.......",
                " #ff#....#lbbbbWEbbb#m......",
                " .##.....#dbbbbbbbbb#.......",
                "..........#lbbbbbbbd#..n....",
                "...........##bbbb##...nfn...",
                ".......................n...."
            ],
            [
                "..............ffn...........",
                "...........##bbbb##.........",
                ".........#dlbbbbbbld#.......",
                " .##.....#llbbWWbbbb#.......",
                " #ff#....#lbbbbWEbbb#m......",
                "#fff#....#dbbbbbbbbb#.......",
                "#ff#......#lbbbbbbbd#.......",
                " ##........##bbbb##....nfn..",
                "  #.....................n..."
            ],
            [
                ".............nfn............",
                " .#........##bbbb##.........",
                " #f#.....#dlbbbbbbld#.......",
                " #n#.....#llbbWWbbbb#.......",
                " #f#.....#lbbbbWEbbb#m......",
                " .#......#dbbbbbbbbb#.......",
                "..........#lbbbbbbbd#.......",
                "...........##bbbb##....ff...",
                ".......................fn..."
            ]
        ]);
}
