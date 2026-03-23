import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kfwabnwzsubqdvhbhtxd.supabase.co";
const SUPABASE_KEY = "sb_publishable_iawxJFBEnbahGD89j72BEQ_bxrA9iVE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: prazos } = await supabase.from("prazos_correios").select("*").limit(1);
  console.log("prazos_correios:", prazos);
}
test();
