import Feed from "@/modules/feed";
import Layout from "./layout/layout";

export default function Home() {
  return (
    <Layout>
      <div className="">
        <Feed />
      </div>
    </Layout>
  );
}
