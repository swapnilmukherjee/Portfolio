/** One-time, field-scoped content update. Preserves every unrelated CMS edit. */
import pg from "pg";
if(process.env.VERCEL_ENV === "preview"){console.log("[profile-update] Preview deployment; live content is unchanged.");process.exit(0)}
const url=process.env.POSTGRES_URL_NON_POOLING||process.env.POSTGRES_URL||process.env.DATABASE_URL;
if(!url){console.log("[profile-update] No database configured; bundled content is current.");process.exit(0)}
const client=new pg.Client({connectionString:url,ssl:{rejectUnauthorized:false}});
const migration="profile-metadata-auth0-2026-11-18";
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(`CREATE TABLE IF NOT EXISTS portfolio_content_migrations (id TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), previous_content JSONB NOT NULL)`);
  const done=await client.query("SELECT id FROM portfolio_content_migrations WHERE id=$1",[migration]);
  if(!done.rowCount){
    const {rows}=await client.query("SELECT data FROM portfolio_content WHERE key='main' FOR UPDATE");
    if(rows[0]){
      const before=rows[0].data;
      const data=structuredClone(before);
      data.profile.location="Seattle, Washington";
      for(const role of data.experience||[])if(role.id==="okta")role.location="Seattle, WA · Remote";
      for(const cert of data.certifications||[])if(cert.name==="Auth0 Certified Developer"){cert.status="earned";delete cert.expected;}
      for(const item of data.highlights||[])if(item.label==="Years in identity")item.value="4+";
      if(data.siteCopy){
        data.siteCopy.aboutSubheading="Customer and workforce identity across healthcare, financial services, and enterprise applications. Now helping Auth0 customers build what comes next.";
        data.siteCopy.experienceHeading="Identity in";
        data.siteCopy.experienceHeadingBold="practice.";
      }
      await client.query("UPDATE portfolio_content SET data=$1::jsonb, updated_at=NOW() WHERE key='main'",[JSON.stringify(data)]);
      await client.query("INSERT INTO portfolio_content_migrations (id,previous_content) VALUES ($1,$2::jsonb)",[migration,JSON.stringify(before)]);
      console.log("[profile-update] Updated location and Auth0 credential. Previous content retained for rollback.");
    }
  }else console.log("[profile-update] Already applied; preserving current CMS content.");
  await client.query("COMMIT");
}catch(error){await client.query("ROLLBACK").catch(()=>{});console.error("[profile-update] Failed; no content changes committed.");process.exitCode=1}
finally{await client.end().catch(()=>{})}

