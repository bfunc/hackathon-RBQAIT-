# self-service dashboarding

self-service dashboarding — managers create data widgets via NL prompt, no dev project/budget required.

- Query generation: AI outputs a structured filter/sort/aggregate spec (not raw SQL), deterministically translated to each connector's dialect — matches the widget/dashboard use case, avoids SQL injection risk, keeps queries transparent and auditable.
- Cost model: AI runs once at widget creation; viewing/refreshing a widget re-executes the saved query with zero AI cost/latency.
- Access control: permission model is core to the pitch, not an add-on — connector/row-level access must gate what a manager can query.
- Transparency: the generated query spec is human-readable, so users/admins can see exactly what a widget does — a trust feature, not just a safety one.
- Positioning: differentiate from "chat with your data" BI tools by targeting dashboard-widget authoring specifically, a narrower and less crowded niche.
