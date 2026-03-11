import { useState } from "react";

const SAMPLE_QR_PARAMS = [
  { siteId: "S001", siteName: "渋谷再開発A棟", companyId: "C001", companyName: "山田建設株式会社" },
  { siteId: "S001", siteName: "渋谷再開発A棟", companyId: "C002", companyName: "東京鉄筋工業" },
  { siteId: "S002", siteName: "品川オフィスビル新築", companyId: "C003", companyName: "南部電気設備" },
];

const INITIAL_RECORDS = [
  { id: 1, siteId: "S001", siteName: "渋谷再開発A棟", companyId: "C001", companyName: "山田建設株式会社", workerName: "田中 一郎", date: "2025-03-09", checkIn: "08:05", checkOut: "17:30", work: "基礎コンクリート打設", note: "午後から雨のため作業速度低下" },
  { id: 2, siteId: "S001", siteName: "渋谷再開発A棟", companyId: "C002", companyName: "東京鉄筋工業", workerName: "鈴木 健太", date: "2025-03-09", checkIn: "07:50", checkOut: "17:00", work: "鉄筋組み立て2F", note: "" },
  { id: 3, siteId: "S002", siteName: "品川オフィスビル新築", companyId: "C003", companyName: "南部電気設備", workerName: "佐藤 美咲", date: "2025-03-09", checkIn: "08:30", checkOut: "18:00", work: "電気配管敷設", note: "資材到着遅延あり" },
];

const C = {
  bg: "#F5F3EF", card: "#FFFFFF", orange: "#E8540A", orangeLight: "#FDF0EB",
  dark: "#1C1A17", mid: "#6B6560", border: "#E2DDD8", green: "#2D9E6B", yellow: "#F5A623",
};

const PAGE = { TOP: "top", SCAN: "scan", FORM: "form", DONE: "done", ADMIN: "admin" };

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  background: "#F5F3EF", border: "1.5px solid #E2DDD8",
  borderRadius: 10, padding: "12px 14px",
  fontSize: 16, color: "#1C1A17",
  outline: "none", fontFamily: "inherit",
};

function TopBar({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "20px 0 16px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer", padding: "0 4px", lineHeight: 1, color: C.dark }}>‹</button>
      <span style={{ fontWeight: 800, fontSize: 17 }}>{title}</span>
    </div>
  );
}

function BigBtn({ icon, label, sub, onClick, color, mt }) {
  return (
    <button onClick={onClick} style={{ width: "100%", background: color, color: "#fff", border: "none", borderRadius: 18, padding: "20px 22px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 14, marginTop: mt ? 12 : 0, boxShadow: color === C.orange ? `0 8px 28px ${color}44` : "none" }}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{label}</div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 3 }}>{sub}</div>
      </div>
      <div style={{ marginLeft: "auto", fontSize: 22, opacity: 0.6 }}>›</div>
    </button>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
      <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>{value}</div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 3 }}>{label}</div>
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#6B6560", marginBottom: 7, letterSpacing: "0.05em" }}>{label}</label>
      {children}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(PAGE.TOP);
  const [scanned, setScanned] = useState(null);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [form, setForm] = useState({ workerName: "", work: "", note: "" });
  const [adminFilter, setAdminFilter] = useState({ site: "", company: "" });
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const today = new Date().toISOString().split("T")[0];
  const nowTime = () => new Date().toTimeString().slice(0, 5);

  // URLパラメータからQRコード情報を読み取る（実際のQRコード運用時に使用）
  const getQRFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const siteId = params.get("site");
    const companyId = params.get("company");
    if (siteId && companyId) {
      const match = SAMPLE_QR_PARAMS.find(q => q.siteId === siteId && q.companyId === companyId);
      if (match) return match;
    }
    return null;
  };

  const handleScan = (qr) => {
    setScanned(qr);
    setForm({ workerName: "", work: "", note: "" });
    setPage(PAGE.FORM);
  };

  const handleSubmit = () => {
    if (!form.workerName.trim() || !form.work.trim()) { showToast("氏名と作業内容を入力してください"); return; }
    const newRec = {
      id: Date.now(), ...scanned,
      workerName: form.workerName, date: today,
      checkIn: nowTime(), checkOut: "", work: form.work, note: form.note,
    };
    setRecords(prev => [newRec, ...prev]);
    setPage(PAGE.DONE);
  };

  const handleCheckOut = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, checkOut: nowTime() } : r));
    showToast("退場時刻を記録しました");
  };

  const filteredRecords = records.filter(r =>
    (!adminFilter.site || r.siteId === adminFilter.site) &&
    (!adminFilter.company || r.companyId === adminFilter.company)
  );
  const sites = [...new Map(records.map(r => [r.siteId, r.siteName])).entries()];
  const companies = [...new Map(records.map(r => [r.companyId, r.companyName])).entries()];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", color: C.dark }}>
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#fff", padding: "12px 24px", borderRadius: 99, fontSize: 13, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)", whiteSpace: "nowrap" }}>{toast}</div>
      )}

      {/* TOP */}
      {page === PAGE.TOP && (
        <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
          <div style={{ background: C.dark, padding: "48px 28px 36px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: C.orange, opacity: 0.15 }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ background: C.orange, borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏗️</div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>現場日報アプリ</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: "0 0 28px", lineHeight: 1.7 }}>QRコードを読み取るだけで<br />会社・現場ごとの個人日報を記録</p>
              <div style={{ display: "flex", gap: 8 }}>
                <Stat label="本日の入場" value={`${records.filter(r => r.date === today).length}名`} />
                <Stat label="現場数" value={`${sites.length}件`} />
                <Stat label="参加会社" value={`${companies.length}社`} />
              </div>
            </div>
          </div>
          <div style={{ padding: "28px 20px 0" }}>
            <BigBtn icon="📷" label="QRコードをスキャンして入場" sub="作業員の方はこちら" onClick={() => setPage(PAGE.SCAN)} color={C.orange} />
            <BigBtn icon="📋" label="管理者ダッシュボード" sub="日報一覧・集計を確認" onClick={() => setPage(PAGE.ADMIN)} color={C.dark} mt />
          </div>
          <div style={{ padding: "28px 20px 0" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.mid, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>本日の入場記録</div>
            {records.filter(r => r.date === today).length === 0
              ? <div style={{ textAlign: "center", color: C.mid, fontSize: 13, padding: "24px 0" }}>まだ記録がありません</div>
              : records.filter(r => r.date === today).slice(0, 5).map(r => (
                <div key={r.id} style={{ background: C.card, borderRadius: 14, padding: "14px 16px", marginBottom: 10, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.workerName}</div>
                    <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{r.companyName} · {r.siteName}</div>
                    <div style={{ fontSize: 11, color: C.mid, marginTop: 3 }}>入場 {r.checkIn}{r.checkOut ? ` → 退場 ${r.checkOut}` : " (作業中)"}</div>
                  </div>
                  {!r.checkOut && (
                    <button onClick={() => handleCheckOut(r.id)} style={{ background: C.orangeLight, color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>退場</button>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* SCAN */}
      {page === PAGE.SCAN && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 40px" }}>
          <TopBar title="QRコードをスキャン" onBack={() => setPage(PAGE.TOP)} />
          <div style={{ background: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ background: "#111", height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 4px)" }} />
              <div style={{ width: 200, height: 200, position: "relative" }}>
                {["topLeft","topRight","bottomLeft","bottomRight"].map(p => (
                  <div key={p} style={{ position: "absolute", width: 28, height: 28, borderColor: C.orange, borderStyle: "solid", borderWidth: 0, borderTopWidth: p.includes("top") ? 3 : 0, borderBottomWidth: p.includes("bottom") ? 3 : 0, borderLeftWidth: p.includes("Left") ? 3 : 0, borderRightWidth: p.includes("Right") ? 3 : 0, top: p.includes("top") ? 0 : "auto", bottom: p.includes("bottom") ? 0 : "auto", left: p.includes("Left") ? 0 : "auto", right: p.includes("Right") ? 0 : "auto" }} />
                ))}
                <style>{`@keyframes scanLine{0%{top:10%}50%{top:90%}100%{top:10%}} .scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E8540A,transparent);animation:scanLine 1.5s ease-in-out infinite;}`}</style>
                <div className="scan-line" />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", lineHeight: 1.8 }}>カメラで<br/>QRコードを<br/>スキャン</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 20px 24px" }}>
              <div style={{ fontSize: 12, color: C.mid, marginBottom: 14, textAlign: "center" }}>― デモ用：現場・会社を選択 ―</div>
              {SAMPLE_QR_PARAMS.map((qr, i) => (
                <button key={i} onClick={() => handleScan(qr)} style={{ width: "100%", background: C.orangeLight, border: `1px solid ${C.orange}55`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>📱</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{qr.siteName}</div>
                    <div style={{ fontSize: 12, color: C.mid }}>{qr.companyName}</div>
                  </div>
                  <div style={{ marginLeft: "auto", color: C.orange, fontSize: 20 }}>›</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FORM */}
      {page === PAGE.FORM && scanned && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 80px" }}>
          <TopBar title="日報を記録" onBack={() => setPage(PAGE.SCAN)} />
          <div style={{ background: C.dark, borderRadius: 16, padding: "18px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: C.orange, borderRadius: 10, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>✅</div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 3 }}>QRコード読み取り完了</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 15 }}>{scanned.siteName}</div>
                <div style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>{scanned.companyName}</div>
              </div>
            </div>
          </div>
          <div style={{ background: C.card, borderRadius: 20, padding: "24px 20px", border: `1px solid ${C.border}` }}>
            <FormRow label="氏名 *">
              <input value={form.workerName} onChange={e => setForm(p => ({ ...p, workerName: e.target.value }))} placeholder="例：田中 一郎" style={inputStyle} />
            </FormRow>
            <FormRow label="本日の作業内容 *">
              <input value={form.work} onChange={e => setForm(p => ({ ...p, work: e.target.value }))} placeholder="例：鉄筋組み立て 3F部分" style={inputStyle} />
            </FormRow>
            <FormRow label="備考・特記事項">
              <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="例：雨のため午後作業中断" rows={3} style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
            </FormRow>
            <div style={{ background: "#F9F7F5", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.mid, display: "flex", gap: 16 }}>
              <span>📅 {today}</span>
              <span>⏰ 入場 {nowTime()}</span>
            </div>
          </div>
          <button onClick={handleSubmit} style={{ marginTop: 20, width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 16, padding: "18px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${C.orange}44` }}>
            日報を提出する →
          </button>
        </div>
      )}

      {/* DONE */}
      {page === PAGE.DONE && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>入場記録が完了しました</h2>
          <p style={{ color: C.mid, fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>本日もお疲れ様です。<br/>退場時はトップ画面から退場時刻を記録してください。</p>
          <div style={{ background: C.card, borderRadius: 16, padding: "18px 20px", marginBottom: 28, border: `1px solid ${C.border}`, textAlign: "left" }}>
            {[["現場", scanned?.siteName], ["会社", scanned?.companyName], ["氏名", form.workerName], ["作業内容", form.work], ["入場時刻", nowTime()]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: 14 }}>
                <span style={{ color: C.mid }}>{k}</span>
                <span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setPage(PAGE.TOP)} style={{ background: C.dark, color: "#fff", border: "none", borderRadius: 14, padding: "15px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>トップに戻る</button>
        </div>
      )}

      {/* ADMIN */}
      {page === PAGE.ADMIN && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 60px" }}>
          <TopBar title="管理者ダッシュボード" onBack={() => setPage(PAGE.TOP)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "本日の入場者", value: records.filter(r => r.date === today).length + "名", icon: "👷" },
              { label: "現場数", value: sites.length + "件", icon: "🏗️" },
              { label: "参加会社", value: companies.length + "社", icon: "🏢" },
            ].map(s => (
              <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: "16px 14px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: C.orange }}>{s.value}</div>
                <div style={{ fontSize: 11, color: C.mid, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: C.dark, borderRadius: 16, padding: "20px", marginBottom: 20 }}>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📲 QRコード発行一覧</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>実運用時：各URLをQRコード化して現場に掲示</div>
            {SAMPLE_QR_PARAMS.map((qr, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{qr.siteName} × {qr.companyName}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4, wordBreak: "break-all" }}>
                  ?site={qr.siteId}&company={qr.companyId}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <select value={adminFilter.site} onChange={e => setAdminFilter(p => ({ ...p, site: e.target.value }))} style={{ ...inputStyle, flex: 1, fontSize: 13 }}>
              <option value="">すべての現場</option>
              {sites.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <select value={adminFilter.company} onChange={e => setAdminFilter(p => ({ ...p, company: e.target.value }))} style={{ ...inputStyle, flex: 1, fontSize: 13 }}>
              <option value="">すべての会社</option>
              {companies.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          <div style={{ fontSize: 12, color: C.mid, marginBottom: 10 }}>{filteredRecords.length}件の記録</div>
          {filteredRecords.map(r => (
            <div key={r.id} style={{ background: C.card, borderRadius: 14, padding: "16px 18px", marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{r.workerName}</span>
                  <span style={{ marginLeft: 10, background: C.orangeLight, color: C.orange, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{r.companyName}</span>
                </div>
                <span style={{ fontSize: 12, color: C.mid }}>{r.date}</span>
              </div>
              <div style={{ fontSize: 13, color: C.mid, marginBottom: 4 }}>🏗️ {r.siteName}</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>📝 {r.work}</div>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.mid }}>
                <span>⏰ 入場 {r.checkIn}</span>
                {r.checkOut ? <span style={{ color: C.green }}>✓ 退場 {r.checkOut}</span> : <span style={{ color: C.yellow }}>● 作業中</span>}
              </div>
              {r.note && <div style={{ marginTop: 8, fontSize: 12, color: C.mid, background: "#F9F7F5", borderRadius: 8, padding: "8px 10px" }}>💬 {r.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
