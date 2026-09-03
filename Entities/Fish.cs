namespace AquariumTaskbar.Entities;

internal sealed class Fish
{
    public float X;
    public float Y;
    public float Speed;
    public float Bob;
    public float BobSpeed;
    public float Phase;
    public bool FacingRight;
    public Color Body;
    public Color Fin;

    public Fish(float x, float y, float speed, bool facingRight, Color body, Color fin, float bob, float bobSpeed, float phase)
    {
        X = x;
        Y = y;
        Speed = speed;
        FacingRight = facingRight;
        Body = body;
        Fin = fin;
        Bob = bob;
        BobSpeed = bobSpeed;
        Phase = phase;
    }
}
