using AquariumTaskbar.Drawing;
using AquariumTaskbar.Entities;

namespace AquariumTaskbar.Scene;

internal sealed class Aquarium
{
    public float Time { get; private set; }
    public List<Bubble> Bubbles { get; } = [];
    public List<Fish> Fish { get; } = [];

    public void Reset()
    {
        int waterHeight = Metrics.TankHeight - Metrics.BottomThickness;

        Bubbles.Clear();
        Bubbles.Add(new Bubble(36, waterHeight - 18, 4, 0.25f, -0.42f));
        Bubbles.Add(new Bubble(78, waterHeight - 28, 3, -0.18f, -0.36f));
        Bubbles.Add(new Bubble(142, waterHeight - 16, 5, 0.22f, -0.48f));
        Bubbles.Add(new Bubble(198, waterHeight - 32, 3, -0.16f, -0.4f));
        Bubbles.Add(new Bubble(246, waterHeight - 20, 4, 0.2f, -0.34f));

        Fish.Clear();
        Fish.Add(new Fish(70, 38, 0.55f, true, Color.FromArgb(255, 255, 140, 40), Color.FromArgb(255, 230, 100, 20), 3.2f, 2.1f, 0.2f));
        Fish.Add(new Fish(180, 52, 0.38f, false, Color.FromArgb(255, 220, 140, 80), Color.FromArgb(255, 180, 100, 60), 2.4f, 1.6f, 1.1f));
        Fish.Add(new Fish(120, 28, 0.46f, true, Color.FromArgb(255, 255, 180, 180), Color.FromArgb(255, 230, 80, 80), 2.8f, 1.9f, 2.4f));
    }

    public void Tick(float dt)
    {
        Time += dt;

        int waterWidth = Metrics.TankWidth - 2 * Metrics.GlassThickness;
        int waterHeight = Metrics.TankHeight - Metrics.BottomThickness;
        float margin = 18f;

        foreach (var bubble in Bubbles)
        {
            bubble.X += bubble.Drift;
            bubble.Y += bubble.Speed;

            if (bubble.X < 8 || bubble.X > waterWidth - bubble.Size - 8)
            {
                bubble.Drift *= -1;
            }

            if (bubble.Y < 6)
            {
                bubble.Y = waterHeight - 16;
                bubble.X = 24 + (Time * 37 + bubble.Size * 13) % (waterWidth - 48);
            }
        }

        foreach (var fish in Fish)
        {
            fish.X += fish.FacingRight ? fish.Speed : -fish.Speed;
            if (fish.X > waterWidth - margin)
            {
                fish.X = waterWidth - margin;
                fish.FacingRight = false;
            }
            else if (fish.X < margin)
            {
                fish.X = margin;
                fish.FacingRight = true;
            }
        }
    }
}
