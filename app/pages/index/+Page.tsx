import { Link } from "../../components/Link";

export default function Page() {
  return (
    <>
      <h1>M&amp;A Deals Widget Demo</h1>
      <p>Type a prompt, get a widget, curate a demo.</p>
      <ul>
        <li>
          <Link href="/admin">Admin</Link> — create, manage, and curate widgets
        </li>
        <li>
          <Link href="/demo">Demo</Link> — the page judges see
        </li>
      </ul>
    </>
  );
}
