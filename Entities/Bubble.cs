namespace AquariumTaskbar.Entities;

internal sealed class Bubble
{
    public float X;
    public float Y;
    public float Drift;
    public float Speed;
    public int Size;

    public Bubble(float x, float y, int size, float drift, float speed)
    {
        X = x;
        Y = y;
        Size = size;
        Drift = drift;
        Speed = speed;
    }
}
