import "./Layout.css";

import logoUrl from "../assets/rbqait-logo.png";
import { Link } from "../components/Link";
import { usePageContext } from "vike-react/usePageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { config } = usePageContext();
  const fullWidth = config.fullWidth ?? false;

  return (
    <div
      style={{
        display: "flex",
        maxWidth: fullWidth ? undefined : 960,
        margin: fullWidth ? undefined : "auto",
      }}
    >
      <Nav />
      <Content>{children}</Content>
    </div>
  );
}

export function Nav() {
  return (
    <Sidebar>
      <Logo />
      <Link href="/">Welcome</Link>
      <Link href="/admin">Admin</Link>
      <Link href="/demo">Demo</Link>
    </Sidebar>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="sidebar"
      style={{
        padding: 20,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        lineHeight: "1.4em",
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

export function Content({ children }: { children: React.ReactNode }) {
  return (
    <div id="page-container" style={{ flex: 1, minWidth: 0 }}>
      <div
        id="page-content"
        style={{
          padding: 28,
          paddingBottom: 50,
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div
      style={{
        marginTop: 20,
        marginBottom: 16,
      }}
    >
      <a href="/">
        <img src={logoUrl} height={72} width={72} alt="logo" style={{ borderRadius: 10, display: "block" }} />
      </a>
    </div>
  );
}
