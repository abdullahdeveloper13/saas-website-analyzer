export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(56,189,248,0.2),transparent)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(56,189,248,0.12),transparent)]" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
