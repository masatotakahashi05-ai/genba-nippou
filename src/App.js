import { useState, useEffect } from "react";

const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

const INIT_SITES = [{ id: "S001", name: "渋谷再開発A棟" }, { id: "S002", name: "品川オフィスビル新築" }];
const INIT_COMPANIES = [{ id: "C001", name: "山田建設株式会社" }, { id: "C002", name: "東京鉄筋工業" }, { id: "C003", name: "南部電気設備" }];
const INIT_PAIRS = [{ siteId: "S001", companyId: "C001" }, { siteId: "S001", companyId: "C002" }, { siteId: "S002", companyId: "C003" }];
const INIT_WORKERS = [{ id: "W001", name: "田中 一郎", companyId: "C001" }, { id: "W002", name: "鈴木 健太", companyId: "C002" }];
const INIT_RECORDS = [{ id: 1, siteId: "S001", companyId: "C001", workerName: "田中 一郎", date: "2025-03-09", checkIn: "08:05", checkOut: "17:30", work: "基礎コンクリート打設", note: "" }];
const ADMIN_PASS = "1234";

const C = { bg: "#F5F3EF", card: "#fff", orange: "#E8540A", orangeLight: "#FDF0EB", dark: "#1C1A17", mid: "#6B6560", border: "#E2DDD8", green: "#2D9E6B", red: "#E53E3E" };
const inp = { width: "100%", boxSizing: "border-box", background: "#F5F3EF", border: "1.5px solid #E2DDD8", borderRadius: 10, padding: "11px 14px", fontSize: 15, color: "#1C1A17", outline: "none", fontFamily: "inherit" };
const PAGE = { TOP: "top", SCAN: "scan", FORM: "form", DONE: "done", ADMIN_LOGIN: "admin_login", ADMIN: "admin" };
const TAB = { RECORDS: "records", SITES: "sites", COMPANIES: "companies", QR: "qr", WORKERS: "workers" };
const uid = () => Math.random().toString(36).slice(2, 8).toUpperCase();
const todayStr = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0, 5);

export default function App() {
  const [page, setPage] = useState(PAGE.TOP);
  const [sites, setSites] = useState(() => load("sites", INIT_SITES));
  const [companies, setCompanies] = useState(() => load("companies", INIT_COMPANIES));
  const [pairs, setPairs] = useState(() => load("pairs", INIT_PAIRS));
  const [workers, setWorkers] = useState(() => load("workers", INIT_WORKERS));
  const [records, setRecords] = useState(() => load("records", INIT_RECORDS));
  const [scanned, setScanned] = useState(null);
  const [form, setForm] = useState({ workerName: "", work: "", note: "" });
  const [toast, setToast] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminError, setAdminError] = useState("");
  const [tab, setTab] = useState(TAB.RECORDS);
  const [filter, setFilter] = useState({ site: "", company: "" });

  useEffect(() => { save("sites", sites); }, [sites]);
  useEffect(() => { save("companies", companies); }, [companies]);
  useEffect(() => { save("pairs", pairs); }, [pairs]);
  useEffect(() => { save("workers", workers); }, [workers]);
  useEffect(() => { save("records", records); }, [records]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };
  const sName = (id) => sites.find(s => s.id === id)?.name || id;
  const cName = (id) => companies.find(c => c.id === id)?.name || id;
  const activePairs = pairs.map(p => ({ ...p, siteName: sName(p.siteId), companyName: cName(p.companyId) }));
  const todayRecs = records.filter(r => r.date === todayStr());
  const filteredRecs = records.filter(r => (!filter.site || r.siteId === filter.site) && (!filter.company || r.companyId === filter.company));

  const handleScan = (pair) => { setScanned(pair); setForm({ workerName: "", work: "", note: "" }); setPage(PAGE.FORM); };
  const handleSubmit = () => {
    if (!form.workerName.trim() || !form.work.trim()) { showToast("氏名と作業内容を入力してください"); return; }
    setRecords(prev => [{ id: Date.now(), siteId: scanned.siteId, companyId: scanned.companyId, workerName: form.workerName, date: todayStr(), checkIn: nowTime(), checkOut: "", work: form.work, note: form.note }, ...prev]);
    setPage(PAGE.DONE);
  };
  const handleCheckOut = (id) => { setRecords(prev => prev.map(r => r.id === id ? { ...r, checkOut: nowTime() } : r)); showToast("退場時刻を記録しました"); };
  const loginAdmin = () => { if (adminPass === ADMIN_PASS) { setPage(PAGE.ADMIN); setAdminPass(""); setAdminError(""); } else setAdminError("パスワードが違います"); };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Hiragino Kaku Gothic ProN','Noto Sans JP',sans-serif", color: C.dark }}>
      {toast && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: C.dark, color: "#fff", padding: "12px 24px", borderRadius: 99, fontSize: 13, fontWeight: 600, zIndex: 9999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>{toast}</div>}

      {page === PAGE.TOP && (
        <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 40 }}>
          <div style={{ background: C.dark, padding: "44px 28px 32px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: C.orange, opacity: 0.15 }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ background: C.orange, borderRadius: 10, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏗️</div>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>現場日報アプリ</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: "0 0 24px", lineHeight: 1.7 }}>QRコードを読み取るだけで<br />会社・現場ごとの個人日報を記録</p>
              <div style={{ display: "flex", gap: 8 }}>
                {[["本日の入場", todayRecs.length + "名"], ["現場数", sites.length + "件"], ["参加会社", companies.length + "社"]].map(([l, v]) => (
                  <div key={l} style={{ flex: 1, background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>{v}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ padding: "24px 20px 0" }}>
            <BigBtn icon="📷" label="QRコードをスキャンして入場" sub="作業員の方はこちら" onClick={() => setPage(PAGE.SCAN)} bg={C.orange} shadow />
            <BigBtn icon="⚙️" label="管理者メニュー" sub="現場・会社・日報の管理" onClick={() => setPage(PAGE.ADMIN_LOGIN)} bg={C.dark} mt />
          </div>
          <div style={{ padding: "24px 20px 0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.mid, letterSpacing: "0.1em", marginBottom: 10 }}>本日の入場記録</div>
            {todayRecs.length === 0
              ? <div style={{ textAlign: "center", color: C.mid, fontSize: 13, padding: "20px 0" }}>まだ記録がありません</div>
              : todayRecs.slice(0, 5).map(r => (
                <div key={r.id} style={{ background: C.card, borderRadius: 12, padding: "13px 15px", marginBottom: 8, border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.workerName}</div>
                    <div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{cName(r.companyId)} · {sName(r.siteId)}</div>
                    <div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>入場 {r.checkIn}{r.checkOut ? ` → 退場 ${r.checkOut}` : " (作業中)"}</div>
                  </div>
                  {!r.checkOut && <button onClick={() => handleCheckOut(r.id)} style={{ background: C.orangeLight, color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>退場</button>}
                </div>
              ))}
          </div>
        </div>
      )}

      {page === PAGE.SCAN && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 40px" }}>
          <TopBar title="QRコードをスキャン" onBack={() => setPage(PAGE.TOP)} />
          <div style={{ background: C.card, borderRadius: 20, overflow: "hidden", border: `1px solid ${C.border}` }}>
            <div style={{ background: "#111", height: 220, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.015) 3px,rgba(255,255,255,0.015) 4px)" }} />
              <div style={{ width: 170, height: 170, position: "relative" }}>
                {["topLeft","topRight","bottomLeft","bottomRight"].map(p => (
                  <div key={p} style={{ position: "absolute", width: 22, height: 22, borderColor: C.orange, borderStyle: "solid", borderWidth: 0, borderTopWidth: p.includes("top") ? 3 : 0, borderBottomWidth: p.includes("bottom") ? 3 : 0, borderLeftWidth: p.includes("Left") ? 3 : 0, borderRightWidth: p.includes("Right") ? 3 : 0, top: p.includes("top") ? 0 : "auto", bottom: p.includes("bottom") ? 0 : "auto", left: p.includes("Left") ? 0 : "auto", right: p.includes("Right") ? 0 : "auto" }} />
                ))}
                <style>{`@keyframes sl{0%{top:10%}50%{top:88%}100%{top:10%}}.sl{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#E8540A,transparent);animation:sl 1.5s ease-in-out infinite;}`}</style>
                <div className="sl" />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: 12, textAlign: "center", lineHeight: 1.8 }}>カメラで<br/>QRコードを<br/>スキャン</div>
              </div>
            </div>
            <div style={{ padding: "18px 18px 22px" }}>
              <div style={{ fontSize: 12, color: C.mid, marginBottom: 12, textAlign: "center" }}>― デモ用：現場・会社を選択 ―</div>
              {activePairs.length === 0
                ? <div style={{ textAlign: "center", color: C.mid, padding: "16px 0", fontSize: 13 }}>QRコードが登録されていません</div>
                : activePairs.map((p, i) => (
                  <button key={i} onClick={() => handleScan(p)} style={{ width: "100%", background: C.orangeLight, border: `1px solid ${C.orange}44`, borderRadius: 12, padding: "13px 15px", marginBottom: 8, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>📱</span>
                    <div><div style={{ fontWeight: 700, fontSize: 13, color: C.dark }}>{p.siteName}</div><div style={{ fontSize: 12, color: C.mid }}>{p.companyName}</div></div>
                    <span style={{ marginLeft: "auto", color: C.orange, fontSize: 20 }}>›</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {page === PAGE.FORM && scanned && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 20px 80px" }}>
          <TopBar title="日報を記録" onBack={() => setPage(PAGE.SCAN)} />
          <div style={{ background: C.dark, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: C.orange, borderRadius: 9, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✅</div>
              <div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>QRコード読み取り完了</div>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{scanned.siteName}</div>
                <div style={{ color: C.orange, fontSize: 13, fontWeight: 600 }}>{scanned.companyName}</div>
              </div>
            </div>
          </div>
          <div style={{ background: C.card, borderRadius: 18, padding: "22px 18px", border: `1px solid ${C.border}` }}>
            <FRow label="氏名 *">
              <input value={form.workerName} onChange={e => setForm(p => ({ ...p, workerName: e.target.value }))} placeholder="例：田中 一郎" style={inp} list="wlist" />
              <datalist id="wlist">{workers.filter(w => w.companyId === scanned.companyId).map(w => <option key={w.id} value={w.name} />)}</datalist>
            </FRow>
            <FRow label="本日の作業内容 *">
              <input value={form.work} onChange={e => setForm(p => ({ ...p, work: e.target.value }))} placeholder="例：鉄筋組み立て 3F部分" style={inp} />
            </FRow>
            <FRow label="備考・特記事項">
              <textarea value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="例：雨のため午後作業中断" rows={3} style={{ ...inp, resize: "none", lineHeight: 1.6 }} />
            </FRow>
            <div style={{ background: "#F9F7F5", borderRadius: 8, padding: "9px 13px", fontSize: 12, color: C.mid, display: "flex", gap: 16 }}>
              <span>📅 {todayStr()}</span><span>⏰ 入場 {nowTime()}</span>
            </div>
          </div>
          <button onClick={handleSubmit} style={{ marginTop: 18, width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 14, padding: "17px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 24px ${C.orange}44` }}>日報を提出する →</button>
        </div>
      )}

      {page === PAGE.DONE && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 60, marginBottom: 14 }}>✅</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>入場記録が完了しました</h2>
          <p style={{ color: C.mid, fontSize: 13, lineHeight: 1.7, marginBottom: 28 }}>退場時はトップ画面から退場時刻を記録してください。</p>
          <div style={{ background: C.card, borderRadius: 14, padding: "16px 18px", marginBottom: 24, border: `1px solid ${C.border}`, textAlign: "left" }}>
            {[["現場", scanned?.siteName], ["会社", scanned?.companyName], ["氏名", form.workerName], ["作業内容", form.work], ["入場時刻", nowTime()]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.border}`, fontSize: 13 }}>
                <span style={{ color: C.mid }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <button onClick={() => setPage(PAGE.TOP)} style={{ background: C.dark, color: "#fff", border: "none", borderRadius: 12, padding: "14px 36px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>トップに戻る</button>
        </div>
      )}

      {page === PAGE.ADMIN_LOGIN && (
        <div style={{ maxWidth: 380, margin: "0 auto", padding: "60px 24px" }}>
          <TopBar title="管理者ログイン" onBack={() => setPage(PAGE.TOP)} />
          <div style={{ background: C.card, borderRadius: 18, padding: "28px 22px", border: `1px solid ${C.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔐</div>
            <p style={{ color: C.mid, fontSize: 13, marginBottom: 22 }}>管理者パスワードを入力してください<br /><span style={{ fontSize: 11 }}>(デモ用パスワード: 1234)</span></p>
            <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} onKeyDown={e => e.key === "Enter" && loginAdmin()} placeholder="パスワード" style={{ ...inp, textAlign: "center", fontSize: 18, letterSpacing: "0.3em", marginBottom: 8 }} />
            {adminError && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{adminError}</div>}
            <button onClick={loginAdmin} style={{ marginTop: 8, width: "100%", background: C.dark, color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>ログイン</button>
          </div>
        </div>
      )}

      {page === PAGE.ADMIN && (
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 60px" }}>
          <TopBar title="管理者メニュー" onBack={() => setPage(PAGE.TOP)} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[["👷", "本日の入場", todayRecs.length + "名"], ["🏗️", "現場数", sites.length + "件"], ["🏢", "参加会社", companies.length + "社"]].map(([ic, l, v]) => (
              <div key={l} style={{ background: C.card, borderRadius: 13, padding: "14px 12px", border: `1px solid ${C.border}`, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.orange }}>{v}</div>
                <div style={{ fontSize: 11, color: C.mid, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
            {[[TAB.RECORDS, "📋 日報"], [TAB.SITES, "🏗️ 現場"], [TAB.COMPANIES, "🏢 会社"], [TAB.QR, "📲 QR"], [TAB.WORKERS, "👷 作業員"]].map(([t, l]) => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 16px", borderRadius: 9, border: tab === t ? `1.5px solid ${C.orange}` : `1.5px solid ${C.border}`, background: tab === t ? C.orangeLight : C.card, color: tab === t ? C.orange : C.mid, fontSize: 13, fontWeight: tab === t ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>{l}</button>
            ))}
          </div>

          {tab === TAB.RECORDS && (
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <select value={filter.site} onChange={e => setFilter(p => ({ ...p, site: e.target.value }))} style={{ ...inp, flex: 1, fontSize: 13 }}>
                  <option value="">すべての現場</option>
                  {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={filter.company} onChange={e => setFilter(p => ({ ...p, company: e.target.value }))} style={{ ...inp, flex: 1, fontSize: 13 }}>
                  <option value="">すべての会社</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 12, color: C.mid, marginBottom: 8 }}>{filteredRecs.length}件</div>
              {filteredRecs.map(r => (
                <div key={r.id} style={{ background: C.card, borderRadius: 13, padding: "14px 16px", marginBottom: 9, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <div><span style={{ fontWeight: 800, fontSize: 14 }}>{r.workerName}</span><span style={{ marginLeft: 8, background: C.orangeLight, color: C.orange, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>{cName(r.companyId)}</span></div>
                    <span style={{ fontSize: 11, color: C.mid }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.mid, marginBottom: 3 }}>🏗️ {sName(r.siteId)}</div>
                  <div style={{ fontSize: 13, marginBottom: 3 }}>📝 {r.work}</div>
                  <div style={{ fontSize: 12, color: C.mid }}>⏰ 入場 {r.checkIn}{r.checkOut ? <span style={{ color: C.green }}> ✓ 退場 {r.checkOut}</span> : <span style={{ color: "#F5A623" }}> ● 作業中</span>}</div>
                  {r.note && <div style={{ marginTop: 7, fontSize: 12, color: C.mid, background: "#F9F7F5", borderRadius: 7, padding: "7px 10px" }}>💬 {r.note}</div>}
                </div>
              ))}
            </div>
          )}
          {tab === TAB.SITES && <MasterList title="現場" icon="🏗️" items={sites} setItems={setSites} showToast={showToast} genId={() => "S" + uid()} />}
          {tab === TAB.COMPANIES && <MasterList title="会社" icon="🏢" items={companies} setItems={setCompanies} showToast={showToast} genId={() => "C" + uid()} />}
          {tab === TAB.QR && <QRManager sites={sites} companies={companies} pairs={pairs} setPairs={setPairs} showToast={showToast} />}
          {tab === TAB.WORKERS && <WorkerManager workers={workers} setWorkers={setWorkers} companies={companies} showToast={showToast} />}
        </div>
      )}
    </div>
  );
}

function MasterList({ title, icon, items, setItems, showToast, genId }) {
  const [editing, setEditing] = useState(null);
  const [val, setVal] = useState("");
  const startEdit = (item) => { setEditing(item.id); setVal(item.name); };
  const startNew = () => { setEditing("new"); setVal(""); };
  const cancel = () => { setEditing(null); setVal(""); };
  const doSave = () => {
    if (!val.trim()) { showToast("名前を入力してください"); return; }
    if (editing === "new") { setItems(prev => [...prev, { id: genId(), name: val.trim() }]); showToast(title + "を追加しました"); }
    else { setItems(prev => prev.map(i => i.id === editing ? { ...i, name: val.trim() } : i)); showToast("変更しました"); }
    cancel();
  };
  const del = (id) => { if (window.confirm("削除しますか？")) { setItems(prev => prev.filter(i => i.id !== id)); showToast("削除しました"); } };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>{icon} {title}一覧（{items.length}件）</span>
        <button onClick={startNew} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>＋ 追加</button>
      </div>
      {editing === "new" && (
        <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orange}`, borderRadius: 12, padding: "14px", marginBottom: 10, display: "flex", gap: 8 }}>
          <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()} placeholder={title + "名を入力"} style={{ ...inp, flex: 1 }} />
          <button onClick={doSave} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "0 16px", fontWeight: 700, cursor: "pointer" }}>保存</button>
          <button onClick={cancel} style={{ background: "#eee", color: C.mid, border: "none", borderRadius: 9, padding: "0 12px", cursor: "pointer" }}>✕</button>
        </div>
      )}
      {items.map(item => (
        <div key={item.id} style={{ background: C.card, borderRadius: 12, padding: "13px 15px", marginBottom: 8, border: `1px solid ${C.border}` }}>
          {editing === item.id ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input autoFocus value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => e.key === "Enter" && doSave()} style={{ ...inp, flex: 1 }} />
              <button onClick={doSave} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "0 14px", fontWeight: 700, cursor: "pointer" }}>保存</button>
              <button onClick={cancel} style={{ background: "#eee", color: C.mid, border: "none", borderRadius: 9, padding: "0 12px", cursor: "pointer" }}>✕</button>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{item.name}</div><div style={{ fontSize: 11, color: C.mid, marginTop: 2 }}>ID: {item.id}</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(item)} style={{ background: "#F0F0F0", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>編集</button>
                <button onClick={() => del(item.id)} style={{ background: "#FEE", color: C.red, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>削除</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function QRManager({ sites, companies, pairs, setPairs, showToast }) {
  const [selSite, setSelSite] = useState("");
  const [selComp, setSelComp] = useState("");
  const sName = (id) => sites.find(s => s.id === id)?.name || id;
  const cName = (id) => companies.find(c => c.id === id)?.name || id;
  const add = () => {
    if (!selSite || !selComp) { showToast("現場と会社を選択してください"); return; }
    if (pairs.some(p => p.siteId === selSite && p.companyId === selComp)) { showToast("すでに登録済みです"); return; }
    setPairs(prev => [...prev, { siteId: selSite, companyId: selComp }]);
    showToast("追加しました"); setSelSite(""); setSelComp("");
  };
  const del = (siteId, companyId) => { if (window.confirm("削除しますか？")) { setPairs(prev => prev.filter(p => !(p.siteId === siteId && p.companyId === companyId))); showToast("削除しました"); } };
  const qrUrl = (p) => `${window.location.origin}${window.location.pathname}?site=${p.siteId}&company=${p.companyId}`;
  return (
    <div>
      <div style={{ background: C.card, borderRadius: 14, padding: "18px 16px", border: `1px solid ${C.border}`, marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>＋ 新しいQRコードを追加</div>
        <select value={selSite} onChange={e => setSelSite(e.target.value)} style={{ ...inp, marginBottom: 8 }}><option value="">現場を選択</option>{sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <select value={selComp} onChange={e => setSelComp(e.target.value)} style={{ ...inp, marginBottom: 12 }}><option value="">会社を選択</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <button onClick={add} style={{ width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>追加する</button>
      </div>
      <div style={{ fontSize: 12, color: C.mid, marginBottom: 10 }}>登録済み（{pairs.length}件）</div>
      {pairs.map((p, i) => (
        <div key={i} style={{ background: C.card, borderRadius: 12, padding: "13px 15px", marginBottom: 8, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{sName(p.siteId)}</div>
              <div style={{ fontSize: 13, color: C.orange, fontWeight: 600 }}>{cName(p.companyId)}</div>
              <div style={{ fontSize: 10, color: C.mid, marginTop: 4, wordBreak: "break-all" }}>?site={p.siteId}&company={p.companyId}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 10 }}>
              <button onClick={() => { navigator.clipboard?.writeText(qrUrl(p)); showToast("URLをコピーしました"); }} style={{ background: "#F0F0F0", border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>URLコピー</button>
              <button onClick={() => del(p.siteId, p.companyId)} style={{ background: "#FEE", color: C.red, border: "none", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>削除</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ background: "#F0F7FF", borderRadius: 12, padding: "14px 16px", marginTop: 10, fontSize: 12, color: "#3B7DD8", lineHeight: 1.8 }}>
        💡 「URLコピー」を押して <a href="https://qr.quel.jp/" target="_blank" rel="noreferrer" style={{ color: "#3B7DD8" }}>qr.quel.jp</a> に貼り付けるとQRコードが作れます
      </div>
    </div>
  );
}

function WorkerManager({ workers, setWorkers, companies, showToast }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", companyId: "" });
  const cName = (id) => companies.find(c => c.id === id)?.name || id;
  const startNew = () => { setEditing("new"); setForm({ name: "", companyId: companies[0]?.id || "" }); };
  const startEdit = (w) => { setEditing(w.id); setForm({ name: w.name, companyId: w.companyId }); };
  const cancel = () => setEditing(null);
  const doSave = () => {
    if (!form.name.trim() || !form.companyId) { showToast("氏名と会社を入力してください"); return; }
    if (editing === "new") { setWorkers(prev => [...prev, { id: "W" + uid(), name: form.name.trim(), companyId: form.companyId }]); showToast("追加しました"); }
    else { setWorkers(prev => prev.map(w => w.id === editing ? { ...w, ...form, name: form.name.trim() } : w)); showToast("変更しました"); }
    cancel();
  };
  const del = (id) => { if (window.confirm("削除しますか？")) { setWorkers(prev => prev.filter(w => w.id !== id)); showToast("削除しました"); } };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 14, fontWeight: 700 }}>👷 作業員一覧（{workers.length}名）</span>
        <button onClick={startNew} style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>＋ 追加</button>
      </div>
      {editing === "new" && (
        <div style={{ background: C.orangeLight, border: `1.5px solid ${C.orange}`, borderRadius: 12, padding: "14px", marginBottom: 12 }}>
          <input autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="氏名" style={{ ...inp, marginBottom: 8 }} />
          <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))} style={{ ...inp, marginBottom: 10 }}><option value="">会社を選択</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={doSave} style={{ flex: 1, background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "10px", fontWeight: 700, cursor: "pointer" }}>保存</button>
            <button onClick={cancel} style={{ background: "#eee", color: C.mid, border: "none", borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      )}
      {workers.map(w => (
        <div key={w.id} style={{ background: C.card, borderRadius: 12, padding: "13px 15px", marginBottom: 8, border: `1px solid ${C.border}` }}>
          {editing === w.id ? (
            <div>
              <input autoFocus value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={{ ...inp, marginBottom: 8 }} />
              <select value={form.companyId} onChange={e => setForm(p => ({ ...p, companyId: e.target.value }))} style={{ ...inp, marginBottom: 10 }}>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={doSave} style={{ flex: 1, background: C.orange, color: "#fff", border: "none", borderRadius: 9, padding: "9px", fontWeight: 700, cursor: "pointer" }}>保存</button>
                <button onClick={cancel} style={{ background: "#eee", color: C.mid, border: "none", borderRadius: 9, padding: "9px 14px", cursor: "pointer" }}>✕</button>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontWeight: 700, fontSize: 14 }}>{w.name}</div><div style={{ fontSize: 12, color: C.mid, marginTop: 2 }}>{cName(w.companyId)}</div></div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(w)} style={{ background: "#F0F0F0", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>編集</button>
                <button onClick={() => del(w.id)} style={{ background: "#FEE", color: C.red, border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>削除</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "18px 0 14px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 26, cursor: "pointer", padding: "0 4px", color: C.dark }}>‹</button>
      <span style={{ fontWeight: 800, fontSize: 16 }}>{title}</span>
    </div>
  );
}

function BigBtn({ icon, label, sub, onClick, bg, shadow, mt }) {
  return (
    <button onClick={onClick} style={{ width: "100%", background: bg, color: "#fff", border: "none", borderRadius: 16, padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, marginTop: mt ? 10 : 0, boxShadow: shadow ? `0 8px 24px ${bg}44` : "none" }}>
      <span style={{ fontSize: 26 }}>{icon}</span>
      <div><div style={{ fontWeight: 800, fontSize: 15 }}>{label}</div><div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{sub}</div></div>
      <span style={{ marginLeft: "auto", fontSize: 20, opacity: 0.5 }}>›</span>
    </button>
  );
}

function FRow({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: C.mid, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
