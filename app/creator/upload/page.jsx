export default function CreatorUploadPage() {
  return (
    <main style={{maxWidth:900,margin:"40px auto",padding:"24px",color:"white"}}>
      <h1>Publish Your Game</h1>
      <p>Your first game is free. Uploads enter moderation before appearing on FlashArcade.</p>

      <form style={{display:"grid",gap:16}}>
        <input placeholder="Game title" />
        <textarea placeholder="Description" rows={5} />
        <input placeholder="Category" />
        <input type="file" accept="image/*" />
        <input type="file" accept=".zip" />
        <input placeholder="Optional website" />
        <button type="button">Validate ZIP (coming in V29)</button>
        <button type="button">Submit for Review (UI)</button>
      </form>

      <hr style={{margin:"32px 0"}}/>

      <h2>Submission checklist</h2>
      <ul>
        <li>ZIP must contain index.html</li>
        <li>No malicious scripts</li>
        <li>Browser-playable game</li>
        <li>Thumbnail recommended</li>
      </ul>

      <p><strong>V28 Status:</strong> Upload portal UI complete. Storage, ZIP validation,
      moderation queue, and publishing pipeline arrive in V29.</p>
    </main>
  );
}
