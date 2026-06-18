"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface EmailRecord {
  id: string;
  type: "sent" | "received";
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  createdAt: string;
}

export default function Dashboard() {
  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dbIsEmpty, setDbIsEmpty] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Admin User Creation Form State
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [newUserSuccess, setNewUserSuccess] = useState<string | null>(null);
  const [newUserError, setNewUserError] = useState<string | null>(null);

  // Email Client State
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [tab, setTab] = useState<"all" | "sent" | "received">("all");

  // Send Email Form State
  const [sendTo, setSendTo] = useState("");
  const [sendSubject, setSendSubject] = useState("");
  const [sendBody, setSendBody] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  // Mock Receive Email Form State
  const [mockFrom, setMockFrom] = useState("");
  const [mockSubject, setMockSubject] = useState("");
  const [mockBody, setMockBody] = useState("");
  const [mockLoading, setMockLoading] = useState(false);
  const [mockSuccess, setMockSuccess] = useState<string | null>(null);
  const [mockError, setMockError] = useState<string | null>(null);

  // Check if session exists and if DB is empty on mount
  const checkSessionAndBootstrap = async () => {
    try {
      setAuthLoading(true);
      // Check session
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
      } else {
        // If not authenticated, check if DB is empty to allow bootstrapping
        const bootstrapRes = await fetch("/api/auth/bootstrap");
        if (bootstrapRes.ok) {
          const bootstrapData = await bootstrapRes.json();
          setDbIsEmpty(bootstrapData.isEmpty);
        }
      }
    } catch (err) {
      console.error("Initialization check failed:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    checkSessionAndBootstrap();
  }, []);

  // Fetch emails for the authenticated user
  const fetchEmails = async () => {
    if (!user) return;
    try {
      setEmailsLoading(true);
      const res = await fetch("/api/emails");
      if (!res.ok) throw new Error("Failed to load emails");
      const data = await res.json();
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmails();
    } else {
      setEmails([]);
      setSelectedEmail(null);
    }
  }, [user]);

  // Handle Authentication (Login / First Admin Registration)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const endpoint = dbIsEmpty ? "/api/auth/register" : "/api/auth/login";
    const body = dbIsEmpty
      ? { email: authEmail, password: authPassword, name: authName }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Algo salió mal durante el proceso");
      }

      if (dbIsEmpty) {
        setAuthSuccess("¡Administrador inicializado correctamente!");
        setTimeout(() => {
          setUser(data.user);
          setDbIsEmpty(false);
          // Clear form fields
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
        }, 1200);
      } else {
        setUser(data.user);
        setAuthEmail("");
        setAuthPassword("");
      }
    } catch (err: any) {
      setAuthError(err.message || "Error de autenticación");
    }
  };

  // Handle Admin Creating New User
  const handleAdminCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserLoading(true);
    setNewUserSuccess(null);
    setNewUserError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail,
          password: newUserPassword,
          name: newUserName,
          role: newUserRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el usuario");
      }

      setNewUserSuccess(`¡Usuario "${data.user.email}" (${data.user.role}) creado con éxito!`);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("user");
    } catch (err: any) {
      setNewUserError(err.message || "Error al registrar usuario");
    } finally {
      setNewUserLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      // Re-check DB status to see if it remains populated
      checkSessionAndBootstrap();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Handle Send Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);
    setSendSuccess(null);
    setSendError(null);

    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: sendTo,
          subject: sendSubject,
          body: sendBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      setSendSuccess("¡Correo enviado con éxito y registrado en Neon!");
      setSendTo("");
      setSendSubject("");
      setSendBody("");
      fetchEmails();
    } catch (err: any) {
      setSendError(err.message || "Error al enviar el correo");
    } finally {
      setSendLoading(false);
    }
  };

  // Handle Simulate Received Email
  const handleMockReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    setMockLoading(true);
    setMockSuccess(null);
    setMockError(null);

    try {
      const res = await fetch("/api/emails/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: mockFrom,
          subject: mockSubject,
          body: mockBody,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to mock receiving email");
      }

      setMockSuccess("¡Correo recibido simulado y guardado en Neon!");
      setMockFrom("");
      setMockSubject("");
      setMockBody("");
      fetchEmails();
    } catch (err: any) {
      setMockError(err.message || "Error al simular la recepción");
    } finally {
      setMockLoading(false);
    }
  };

  // Filter emails based on selected tab
  const filteredEmails = emails.filter((email) => {
    if (tab === "sent") return email.type === "sent";
    if (tab === "received") return email.type === "received";
    return true;
  });

  // 1. Loading State
  if (authLoading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛡️</div>
          <p style={{ letterSpacing: "0.1em" }}>VERIFICANDO ACCESO SEGURO...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Login / Register Card)
  if (!user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Ópera Prima</h1>
            <p className={styles.authSubtitle}>
              {dbIsEmpty ? "Inicializar Administrador" : "Acceso Restringido"}
            </p>
          </div>

          {authSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <span>{authSuccess}</span>
            </div>
          )}

          {authError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {dbIsEmpty && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Administrador</label>
                <input
                  type="text"
                  required
                  placeholder="Administrador principal"
                  className={styles.formInput}
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                className={styles.formInput}
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className={styles.formInput}
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              {dbIsEmpty ? "Inicializar Admin" : "Iniciar Sesión"}
            </button>
          </form>

          {!dbIsEmpty && (
            <div className={styles.authFooter} style={{ fontSize: "0.75rem" }}>
              <span>
                Acceso reservado a la compañía Ópera Prima.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard UI
  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>Ópera Prima</span>
            <span className={styles.brandSubtitle}>Dashboard de Mails</span>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user.name || "Usuario"}
                <span
                  style={{
                    fontSize: "0.7rem",
                    marginLeft: "0.5rem",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "3px",
                    background: user.role === "admin" ? "var(--dark-amaranth)" : "rgba(255,255,255,0.1)",
                    color: "#fff",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {user.role}
                </span>
              </span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>

            <button onClick={handleLogout} className={styles.logoutBtn}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar Sesión
            </button>

            <Link href="/" className={styles.backBtn}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Ir a la Web
            </Link>
          </div>
        </header>

        {/* Dashboard Grid Content */}
        <div className={styles.dashboardGrid}>
          {/* Left Column: Forms */}
          <div className={styles.leftColumn}>
            {/* Admin-only: Register User Form */}
            {user.role === "admin" && (
              <>
                <div className={styles.panel}>
                  <h2 className={styles.panelTitle}>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: "var(--camel)" }}
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Administración: Crear Usuario
                  </h2>

                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--smoky-rose)",
                      marginBottom: "1rem",
                      marginTop: "-1rem",
                    }}
                  >
                    Solo administradores pueden crear nuevos accesos.
                  </p>

                  {newUserSuccess && (
                    <div className={`${styles.alert} ${styles.alertSuccess}`}>
                      <span>{newUserSuccess}</span>
                    </div>
                  )}

                  {newUserError && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                      <span>{newUserError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAdminCreateUser}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Nombre</label>
                      <input
                        type="text"
                        required
                        placeholder="Nombre del nuevo usuario"
                        className={styles.formInput}
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Email</label>
                      <input
                        type="email"
                        required
                        placeholder="usuario@dominio.com"
                        className={styles.formInput}
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Contraseña</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        className={styles.formInput}
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Rol</label>
                      <select
                        className={styles.formInput}
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        style={{ background: "rgba(0, 0, 0, 0.3)" }}
                      >
                        <option value="user" style={{ background: "#000" }}>Usuario regular</option>
                        <option value="admin" style={{ background: "#000" }}>Administrador</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={newUserLoading}
                      className={styles.mockBtn}
                      style={{ borderStyle: "solid", borderColor: "var(--camel)" }}
                    >
                      {newUserLoading ? "Registrando..." : "Registrar Usuario"}
                    </button>
                  </form>
                </div>
                <hr className={styles.sectionDivider} />
              </>
            )}

            {/* Send Mail Form */}
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--camel)" }}
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Enviar Correo
              </h2>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--smoky-rose)",
                  marginBottom: "1rem",
                  marginTop: "-1rem",
                }}
              >
                Remitente configurado: <strong>{user.email}</strong>
              </p>

              {sendSuccess && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  <span>{sendSuccess}</span>
                </div>
              )}

              {sendError && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  <span>{sendError}</span>
                </div>
              )}

              <form onSubmit={handleSendEmail}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Destinatario (To)</label>
                  <input
                    type="email"
                    required
                    placeholder="destinatario@ejemplo.com"
                    className={styles.formInput}
                    value={sendTo}
                    onChange={(e) => setSendTo(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Asunto (Subject)</label>
                  <input
                    type="text"
                    required
                    placeholder="Asunto del correo"
                    className={styles.formInput}
                    value={sendSubject}
                    onChange={(e) => setSendSubject(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mensaje (Body)</label>
                  <textarea
                    required
                    placeholder="Redactar el mensaje aquí..."
                    className={styles.formTextarea}
                    value={sendBody}
                    onChange={(e) => setSendBody(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendLoading}
                  className={styles.submitBtn}
                >
                  {sendLoading ? "Enviando..." : "Enviar Email"}
                </button>
              </form>
            </div>

            <hr className={styles.sectionDivider} />

            {/* Mock Receive Mail Form */}
            <div className={styles.panel}>
              <h2 className={styles.panelTitle}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: "var(--camel)" }}
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Simulador de Entrada (Mocks)
              </h2>

              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--smoky-rose)",
                  marginBottom: "1rem",
                  marginTop: "-1rem",
                }}
              >
                Destinatario simulado: <strong>{user.email}</strong>
              </p>

              {mockSuccess && (
                <div className={`${styles.alert} ${styles.alertSuccess}`}>
                  <span>{mockSuccess}</span>
                </div>
              )}

              {mockError && (
                <div className={`${styles.alert} ${styles.alertError}`}>
                  <span>{mockError}</span>
                </div>
              )}

              <form onSubmit={handleMockReceive}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Remitente (From)</label>
                  <input
                    type="email"
                    required
                    placeholder="remitente@ejemplo.com"
                    className={styles.formInput}
                    value={mockFrom}
                    onChange={(e) => setMockFrom(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Asunto (Subject)</label>
                  <input
                    type="text"
                    required
                    placeholder="Asunto simulado"
                    className={styles.formInput}
                    value={mockSubject}
                    onChange={(e) => setMockSubject(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mensaje (Body)</label>
                  <textarea
                    required
                    placeholder="Cuerpo del correo entrante..."
                    className={styles.formTextarea}
                    value={mockBody}
                    onChange={(e) => setMockBody(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={mockLoading}
                  className={styles.mockBtn}
                >
                  {mockLoading ? "Simulando..." : "Simular Recepción"}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Mail History */}
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: "var(--camel)" }}
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              Bandeja de Entrada ({user.email})
            </h2>

            {/* Controls */}
            <div className={styles.inboxControls}>
              <div className={styles.tabs}>
                <button
                  onClick={() => setTab("all")}
                  className={`${styles.tabBtn} ${
                    tab === "all" ? styles.tabActive : ""
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTab("sent")}
                  className={`${styles.tabBtn} ${
                    tab === "sent" ? styles.tabActive : ""
                  }`}
                >
                  Enviados
                </button>
                <button
                  onClick={() => setTab("received")}
                  className={`${styles.tabBtn} ${
                    tab === "received" ? styles.tabActive : ""
                  }`}
                >
                  Recibidos
                </button>
              </div>

              <button onClick={fetchEmails} className={styles.refreshBtn}>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Actualizar
              </button>
            </div>

            {/* Email List */}
            {emailsLoading ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⏳</div>
                <p>Cargando tus correos...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📁</div>
                <p>No se encontraron correos para este usuario.</p>
              </div>
            ) : (
              <div className={styles.emailList}>
                {filteredEmails.map((email) => {
                  const isSent = email.type === "sent";
                  const dateStr = new Date(email.createdAt).toLocaleString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`${styles.emailItem} ${
                        selectedEmail?.id === email.id ? styles.emailActive : ""
                      }`}
                    >
                      <div className={styles.emailMeta}>
                        <span
                          className={`${styles.badge} ${
                            isSent ? styles.badgeSent : styles.badgeReceived
                          }`}
                        >
                          {isSent ? "Enviado" : "Recibido"}
                        </span>
                        <span className={styles.emailDate}>{dateStr}</span>
                      </div>

                      <div className={styles.emailHeaderRow}>
                        <span className={styles.emailAddress}>
                          {isSent
                            ? `Para: ${email.to.join(", ")}`
                            : `De: ${email.from}`}
                        </span>
                        <span className={styles.emailSubject}>
                          {email.subject}
                        </span>
                      </div>

                      <p className={styles.emailSnippet}>
                        {email.text ||
                          (email.html
                            ? email.html.replace(/<[^>]*>/g, "")
                            : "")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Selected Email Detailed View */}
            {selectedEmail && (
              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h3
                    className={styles.emailSubject}
                    style={{ fontSize: "1.4rem" }}
                  >
                    {selectedEmail.subject}
                  </h3>

                  <div className={styles.detailMetaGrid}>
                    <span className={styles.metaLabel}>Tipo:</span>
                    <span className={styles.metaValue}>
                      <span
                        className={`${styles.badge} ${
                          selectedEmail.type === "sent"
                            ? styles.badgeSent
                            : styles.badgeReceived
                        }`}
                      >
                        {selectedEmail.type === "sent" ? "Enviado" : "Recibido"}
                      </span>
                    </span>

                    <span className={styles.metaLabel}>De:</span>
                    <span className={styles.metaValue}>
                      {selectedEmail.from}
                    </span>

                    <span className={styles.metaLabel}>Para:</span>
                    <span className={styles.metaValue}>
                      {selectedEmail.to.join(", ")}
                    </span>

                    <span className={styles.metaLabel}>Fecha:</span>
                    <span className={styles.metaValue}>
                      {new Date(selectedEmail.createdAt).toLocaleString(
                        "es-AR"
                      )}
                    </span>
                  </div>
                </div>

                <div className={styles.detailBody}>
                  {selectedEmail.html ? (
                    <iframe
                      title="Email Content"
                      srcDoc={selectedEmail.html}
                      className={styles.detailContent}
                      style={{
                        width: "100%",
                        height: "300px",
                        border: "none",
                        background: "#fff",
                        borderRadius: "6px",
                      }}
                    />
                  ) : (
                    <div
                      className={styles.detailContent}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {selectedEmail.text}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
