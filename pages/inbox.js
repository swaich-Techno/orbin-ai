import Head from "next/head";
import MailApp from "../components/MailApp";

export default function InboxPage() {
  return (
    <>
      <Head>
        <title>Inbox | Orbin Mail OS</title>
      </Head>
      <MailApp initialMailbox="inbox" />
    </>
  );
}
