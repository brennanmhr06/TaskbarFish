namespace AquariumTaskbar.Drawing;

internal static class Metrics
{
    public const int TankWidth = 320;
    public const int TankHeight = 120;
    public const int LidDepth = 18;
    public const int LidInset = 22;
    public const int GlassThickness = 5;
    public const int BottomThickness = 8;
    public const int ButtonSize = 22;
    public const int ButtonMargin = 5;
    public const int MenuHeight = 480;

    public static int TankFrameHeight => LidDepth + TankHeight;

    public static Rectangle CloseButtonRect => new(TankWidth - 36, 14, 22, 22);
    public static Rectangle LevelButtonRect => new(TankWidth - 68, 64, 50, 32);

    public static Rectangle MenuBounds => new(0, 0, TankWidth, MenuHeight);

    public static Rectangle ButtonBounds(int menuOffset) => new(
        TankWidth - GlassThickness - ButtonMargin - ButtonSize,
        menuOffset + LidDepth + ButtonMargin,
        ButtonSize,
        ButtonSize);
}
