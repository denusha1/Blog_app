import Link from "next/link";
import { ArrowRight, CircleHelp } from "lucide-react";

const questions=[
  ["How do I publish a story?","Create a free account, choose Write, add your title and story, then publish it from the editor."],
  ["Can I save stories for later?","Yes. Open any published story and use its bookmark control. Find saved stories on your Bookmarks page."],
  ["How do I follow an author?","Open an author profile from one of their stories and select Follow. Their new work appears in your Following feed."],
  ["Where can I see stories I have read?","Your Reading history page keeps recently opened stories in this browser on this device."],
  ["I forgot my password. How can I reset it?","Password reset is not available yet. Contact us and include the account username so the team can help."],
  ["How can I report a story?","Use the report control on a published story. The moderation team can review submitted reports."],
];
export default function HelpPage(){return <main className="page-wrap"><div className="shell editorial-page help-page"><div className="section-kicker"><CircleHelp size={14}/> HELP CENTER</div><h1>Good questions.<br/><em>Clear answers.</em></h1><p className="editorial-lede">Quick help for reading, writing, and finding your way around Ink &amp; Ideas.</p><div className="faq-list">{questions.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div><div className="help-contact"><div><strong>Still need a hand?</strong><p>Send us a note and we’ll help you find the answer.</p></div><Link className="button button-dark" href="/contact">Contact us <ArrowRight size={15}/></Link></div></div></main>}
