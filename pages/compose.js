import Head from "next/head";
import MailApp from "../components/MailApp";

export default function ComposePage() {
  return (
    <>
      <Head>
        <title>Compose | Orbin Mail OS</title>
      </Head>
      <MailApp initialMailbox="drafts" initialComposeOpen />
    </>
  );
}
