"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt?: string;
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

interface ShowRecord {
  id: string;
  title: string;
  composer: string;
  tag?: string | null;
  desc: string;
  image: string;
  type: string; // "billboard" | "calendar"
  category?: string | null;
  dates?: string | null;
  price?: string | null;
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

  // Sidebar Tab Navigation
  const [activeSection, setActiveSection] = useState<"mails" | "users" | "landing">("mails");

  // Email Client state
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [tab, setTab] = useState<"all" | "sent" | "received">("all");
  const [mailPaneMode, setMailPaneMode] = useState<"read" | "compose" | "simulate">("read");

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

  // Users Tab State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState("user");
  const [newUserLoading, setNewUserLoading] = useState(false);
  const [newUserSuccess, setNewUserSuccess] = useState<string | null>(null);
  const [newUserError, setNewUserError] = useState<string | null>(null);

  // Content Management (Landing / Shows) Tab State
  const [shows, setShows] = useState<ShowRecord[]>([]);
  const [showsLoading, setShowsLoading] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ShowRecord | null>(null);
  const [showFormMode, setShowFormMode] = useState<"edit" | "create" | "closed">("closed");

  // Show Form Fields
  const [showTitle, setShowTitle] = useState("");
  const [showComposer, setShowComposer] = useState("");
  const [showTag, setShowTag] = useState("");
  const [showDesc, setShowDesc] = useState("");
  const [showImage, setShowImage] = useState("");
  const [showType, setShowType] = useState("calendar"); // "billboard" | "calendar"
  const [showCategory, setShowCategory] = useState("opera");
  const [showDates, setShowDates] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [showFormLoading, setShowFormLoading] = useState(false);
  const [showFormSuccess, setShowFormSuccess] = useState<string | null>(null);
  const [showFormError, setShowFormError] = useState<string | null>(null);

  // Check if session exists and if DB is empty on mount
  const checkSessionAndBootstrap = async () => {
    try {
      setAuthLoading(true);
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        setUser(sessionData.user);
      } else {
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

  // Sync content based on active section
  useEffect(() => {
    if (user) {
      if (activeSection === "mails") {
        fetchEmails();
      } else if (activeSection === "users") {
        fetchUsers();
      } else if (activeSection === "landing") {
        fetchShows();
      }
    }
  }, [user, activeSection]);

  // Sync edit form fields when selectedShow changes
  useEffect(() => {
    if (selectedShow && showFormMode === "edit") {
      setShowTitle(selectedShow.title || "");
      setShowComposer(selectedShow.composer || "");
      setShowTag(selectedShow.tag || "");
      setShowDesc(selectedShow.desc || "");
      setShowImage(selectedShow.image || "");
      setShowType(selectedShow.type || "calendar");
      setShowCategory(selectedShow.category || "opera");
      setShowDates(selectedShow.dates || "");
      setShowPrice(selectedShow.price || "");
      setShowFormSuccess(null);
      setShowFormError(null);
    } else if (showFormMode === "create") {
      setShowTitle("");
      setShowComposer("");
      setShowTag("");
      setShowDesc("");
      setShowImage("/images/hero_carmen.png");
      setShowType("calendar");
      setShowCategory("opera");
      setShowDates("");
      setShowPrice("");
      setShowFormSuccess(null);
      setShowFormError(null);
    }
  }, [selectedShow, showFormMode]);

  // Fetch emails
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
        setMailPaneMode("read");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailsLoading(false);
    }
  };

  // Fetch users (admin only)
  const fetchUsers = async () => {
    if (!user || user.role !== "admin") return;
    try {
      setUsersLoading(true);
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch shows
  const fetchShows = async () => {
    try {
      setShowsLoading(true);
      const res = await fetch("/api/shows");
      if (!res.ok) throw new Error("Failed to load shows");
      const data = await res.json();
      setShows(data);
      if (data.length > 0 && !selectedShow) {
        setSelectedShow(data[0]);
        setShowFormMode("edit");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setShowsLoading(false);
    }
  };

  // Handle Authentication (Login / Bootstrap Admin)
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

      setNewUserSuccess(`¡Usuario "${data.user.email}" creado con éxito!`);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("user");
      fetchUsers(); // Reload list
    } catch (err: any) {
      setNewUserError(err.message || "Error al registrar usuario");
    } finally {
      setNewUserLoading(false);
    }
  };

  // Handle Delete User (admin only)
  const handleDeleteUser = async (id: string) => {
    if (id === user?.id) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user");
      }
      setNewUserSuccess("Usuario eliminado correctamente.");
      fetchUsers();
    } catch (err: any) {
      setNewUserError(err.message || "Error al eliminar usuario");
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
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

      setSendSuccess("¡Correo enviado con éxito!");
      setSendTo("");
      setSendSubject("");
      setSendBody("");
      fetchEmails();
      setTimeout(() => setMailPaneMode("read"), 1500);
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

      setMockSuccess("¡Correo simulado recibido en la base de datos!");
      setMockFrom("");
      setMockSubject("");
      setMockBody("");
      fetchEmails();
      setTimeout(() => setMailPaneMode("read"), 1500);
    } catch (err: any) {
      setMockError(err.message || "Error al simular la recepción");
    } finally {
      setMockLoading(false);
    }
  };

  // Handle Save Show (Create/Edit Content)
  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowFormLoading(true);
    setShowFormSuccess(null);
    setShowFormError(null);

    const bodyData: any = {
      title: showTitle,
      composer: showComposer,
      tag: showTag || null,
      desc: showDesc,
      image: showImage,
      type: showType,
      category: showType === "calendar" ? showCategory : null,
      dates: showType === "calendar" ? showDates : null,
      price: showType === "calendar" ? showPrice : null,
    };

    if (showFormMode === "edit" && selectedShow) {
      bodyData.id = selectedShow.id;
    }

    try {
      const res = await fetch("/api/shows", {
        method: showFormMode === "edit" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la obra");
      }

      setShowFormSuccess(
        showFormMode === "edit"
          ? "¡Obra actualizada con éxito!"
          : "¡Obra creada con éxito!"
      );

      fetchShows();

      if (showFormMode === "create") {
        setShowTitle("");
        setShowComposer("");
        setShowTag("");
        setShowDesc("");
        setShowImage("/images/hero_carmen.png");
        setShowDates("");
        setShowPrice("");
        setShowFormMode("closed");
      } else {
        setSelectedShow(data);
      }
    } catch (err: any) {
      setShowFormError(err.message || "Error de red al guardar");
    } finally {
      setShowFormLoading(false);
    }
  };

  // Handle Delete Show
  const handleDeleteShow = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta obra?")) return;

    try {
      const res = await fetch(`/api/shows?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar la obra");
      }

      setShowFormSuccess("Obra eliminada con éxito.");
      setSelectedShow(null);
      setShowFormMode("closed");
      fetchShows();
    } catch (err: any) {
      setShowFormError(err.message || "Error de red al eliminar la obra");
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
        <div className={styles.authCard} style={{ textAlign: "center" }}>
          <h1 className={styles.authTitle}>Ópera Prima</h1>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>⏳</div>
            <p>Cargando sesión y base de datos...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Login / Register First Admin)
  if (!user) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1 className={styles.authTitle}>Ópera Prima</h1>
            <p className={styles.authSubtitle}>
              {dbIsEmpty ? "Inicializar Administrador" : "Panel de Gestión"}
            </p>
          </div>

          {authError && (
            <div className={`${styles.alert} ${styles.alertError}`}>
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className={`${styles.alert} ${styles.alertSuccess}`}>
              <span>{authSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit}>
            {dbIsEmpty && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nombre del Administrador</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre completo"
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

            <div className={styles.authFooter} style={{ fontSize: "0.75rem" }}>
              {dbIsEmpty ? (
                <span style={{ color: "var(--camel)" }}>
                  * No hay usuarios registrados. El primer usuario será Administrador.
                </span>
              ) : (
                <span>Desarrollado para Ópera Prima Producciones</span>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Authenticated Dashboard UI
  return (
    <div className={styles.dashboardLayout}>
      
      {/* LEFT SIDEBAR NAVBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.sidebarBrand}>
            <span className={styles.brandTitle}>Ópera Prima</span>
            <span className={styles.brandSubtitle}>Panel de Control</span>
          </div>

          <nav className={styles.sidebarNav}>
            <button
              onClick={() => setActiveSection("mails")}
              className={`${styles.menuBtn} ${activeSection === "mails" ? styles.menuActive : ""}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Mails / Casilla
            </button>
            
            {user.role === "admin" && (
              <button
                onClick={() => setActiveSection("users")}
                className={`${styles.menuBtn} ${activeSection === "users" ? styles.menuActive : ""}`}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Usuarios
              </button>
            )}

            <button
              onClick={() => setActiveSection("landing")}
              className={`${styles.menuBtn} ${activeSection === "landing" ? styles.menuActive : ""}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 8 3 3-3 3" />
              </svg>
              Contenido Landing
            </button>
          </nav>
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarUserMeta}>
              <span className={styles.userName}>{user.name || "Usuario"}</span>
              <span className={styles.roleBadge}>{user.role}</span>
            </div>
            <span className={styles.userEmail}>{user.email}</span>
          </div>

          <div className={styles.sidebarActions}>
            <Link href="/" className={styles.sidebarBtnLink}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Ir a la Web
            </Link>
            
            <button onClick={handleLogout} className={styles.sidebarLogoutBtn}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className={styles.mainContent}>
        
        {/* SECTION: MAIL BOX CLIENT */}
        {activeSection === "mails" && (
          <div className={styles.sectionContainer}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.sectionTitle}>Bandeja de Correo</h1>
                <p className={styles.sectionSubtitle}>Maneja tus correos recibidos y enviados con Resend</p>
              </div>
            </div>

            <div className={styles.mailGrid}>
              
              {/* Mail Inbox Left Pane */}
              <div className={styles.inboxPane}>
                <div className={styles.inboxControls}>
                  <div className={styles.tabs}>
                    <button
                      onClick={() => setTab("all")}
                      className={`${styles.tabBtn} ${tab === "all" ? styles.tabActive : ""}`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setTab("sent")}
                      className={`${styles.tabBtn} ${tab === "sent" ? styles.tabActive : ""}`}
                    >
                      Enviados
                    </button>
                    <button
                      onClick={() => setTab("received")}
                      className={`${styles.tabBtn} ${tab === "received" ? styles.tabActive : ""}`}
                    >
                      Recibidos
                    </button>
                  </div>

                  <button onClick={fetchEmails} className={styles.refreshBtn} title="Actualizar correos">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                    Actualizar
                  </button>
                </div>

                <div className={styles.actionRow}>
                  <button
                    onClick={() => {
                      setMailPaneMode("compose");
                      setSendSuccess(null);
                      setSendError(null);
                    }}
                    className={`${styles.submitBtn} ${mailPaneMode === "compose" ? styles.btnActive : ""}`}
                    style={{ background: "linear-gradient(135deg, var(--burnt-rose) 0%, var(--dark-amaranth) 100%)" }}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                    </svg>
                    Redactar Correo
                  </button>
                  
                  <button
                    onClick={() => {
                      setMailPaneMode("simulate");
                      setMockSuccess(null);
                      setMockError(null);
                    }}
                    className={styles.mockBtn}
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Simulador Entrada
                  </button>
                </div>

                {/* Email Items Scroll */}
                <div className={styles.emailListContainer}>
                  {emailsLoading ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>⏳</div>
                      <p>Cargando tus correos...</p>
                    </div>
                  ) : filteredEmails.length === 0 ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>📁</div>
                      <p>No se encontraron correos.</p>
                    </div>
                  ) : (
                    <div className={styles.emailList}>
                      {filteredEmails.map((email) => {
                        const isSent = email.type === "sent";
                        const dateStr = new Date(email.createdAt).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <div
                            key={email.id}
                            onClick={() => {
                              setSelectedEmail(email);
                              setMailPaneMode("read");
                            }}
                            className={`${styles.emailItem} ${
                              selectedEmail?.id === email.id && mailPaneMode === "read" ? styles.emailActive : ""
                            }`}
                          >
                            <div className={styles.emailMeta}>
                              <span className={`${styles.badge} ${isSent ? styles.badgeSent : styles.badgeReceived}`}>
                                {isSent ? "Enviado" : "Recibido"}
                              </span>
                              <span className={styles.emailDate}>{dateStr}</span>
                            </div>

                            <div className={styles.emailHeaderRow}>
                              <span className={styles.emailAddress}>
                                {isSent ? `Para: ${email.to.join(", ")}` : `De: ${email.from}`}
                              </span>
                              <span className={styles.emailSubject}>{email.subject}</span>
                            </div>

                            <p className={styles.emailSnippet}>
                              {email.text || (email.html ? email.html.replace(/<[^>]*>/g, "") : "")}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Mail Pane Details / Forms Right Panel */}
              <div className={styles.detailPane}>
                
                {/* MODE: COMPOSE EMAIL */}
                {mailPaneMode === "compose" && (
                  <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Redactar y Enviar Correo
                    </h2>
                    <p className={styles.formHint}>Remitente oficial: <strong>{user.email}</strong></p>

                    {sendSuccess && <div className={`${styles.alert} ${styles.alertSuccess}`}>{sendSuccess}</div>}
                    {sendError && <div className={`${styles.alert} ${styles.alertError}`}>{sendError}</div>}

                    <form onSubmit={handleSendEmail} style={{ marginTop: "1rem" }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Destinatario</label>
                        <input
                          type="email"
                          required
                          placeholder="destinatario@correo.com"
                          className={styles.formInput}
                          value={sendTo}
                          onChange={(e) => setSendTo(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Asunto</label>
                        <input
                          type="text"
                          required
                          placeholder="Consulta sobre Ópera Prima..."
                          className={styles.formInput}
                          value={sendSubject}
                          onChange={(e) => setSendSubject(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Mensaje</label>
                        <textarea
                          required
                          placeholder="Hola, te escribo para..."
                          className={styles.formTextarea}
                          value={sendBody}
                          onChange={(e) => setSendBody(e.target.value)}
                        />
                      </div>

                      <button type="submit" disabled={sendLoading} className={styles.submitBtn}>
                        {sendLoading ? "Enviando..." : "Enviar vía Resend"}
                      </button>
                    </form>
                  </div>
                )}

                {/* MODE: SIMULATE RECEIVED EMAIL */}
                {mailPaneMode === "simulate" && (
                  <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      Simulador de Entrada (Mocks)
                    </h2>
                    <p className={styles.formHint}>Simula un correo enviado a: <strong>{user.email}</strong></p>

                    {mockSuccess && <div className={`${styles.alert} ${styles.alertSuccess}`}>{mockSuccess}</div>}
                    {mockError && <div className={`${styles.alert} ${styles.alertError}`}>{mockError}</div>}

                    <form onSubmit={handleMockReceive} style={{ marginTop: "1rem" }}>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Remitente simulado (From)</label>
                        <input
                          type="email"
                          required
                          placeholder="cliente@ejemplo.com"
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
                          placeholder="Solicitud de presupuesto de ópera"
                          className={styles.formInput}
                          value={mockSubject}
                          onChange={(e) => setMockSubject(e.target.value)}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Cuerpo del correo simulado</label>
                        <textarea
                          required
                          placeholder="Hola, me gustaría recibir más información..."
                          className={styles.formTextarea}
                          value={mockBody}
                          onChange={(e) => setMockBody(e.target.value)}
                        />
                      </div>

                      <button type="submit" disabled={mockLoading} className={styles.mockBtn}>
                        {mockLoading ? "Simulando..." : "Simular Recepción"}
                      </button>
                    </form>
                  </div>
                )}

                {/* MODE: READ EMAIL */}
                {mailPaneMode === "read" && selectedEmail && (
                  <div className={styles.panel}>
                    <div className={styles.detailHeader}>
                      <h3 className={styles.emailSubject} style={{ fontSize: "1.4rem", marginBottom: "1rem" }}>
                        {selectedEmail.subject}
                      </h3>

                      <div className={styles.detailMetaGrid}>
                        <span className={styles.metaLabel}>De:</span>
                        <span className={styles.metaValue}>{selectedEmail.from}</span>

                        <span className={styles.metaLabel}>Para:</span>
                        <span className={styles.metaValue}>{selectedEmail.to.join(", ")}</span>

                        <span className={styles.metaLabel}>Fecha:</span>
                        <span className={styles.metaValue}>
                          {new Date(selectedEmail.createdAt).toLocaleString("es-AR")}
                        </span>
                      </div>
                    </div>

                    <div className={styles.detailBody}>
                      {selectedEmail.html ? (
                        <iframe
                          title="Contenido del Correo"
                          srcDoc={selectedEmail.html}
                          className={styles.detailContentIframe}
                        />
                      ) : (
                        <div className={styles.detailContentText}>{selectedEmail.text}</div>
                      )}
                    </div>
                  </div>
                )}

                {mailPaneMode === "read" && !selectedEmail && (
                  <div className={styles.emptyState} style={{ background: "var(--glass-bg)", borderRadius: "12px" }}>
                    <div className={styles.emptyIcon}>✉️</div>
                    <p>Selecciona un correo de la lista para leer su contenido.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: USERS MANAGEMENT */}
        {activeSection === "users" && user.role === "admin" && (
          <div className={styles.sectionContainer}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.sectionTitle}>Gestión de Usuarios</h1>
                <p className={styles.sectionSubtitle}>Crea y administra los accesos del personal administrativo</p>
              </div>
            </div>

            <div className={styles.usersGrid}>
              
              {/* Add User Form Panel */}
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Crear Nuevo Acceso
                </h2>

                {newUserSuccess && <div className={`${styles.alert} ${styles.alertSuccess}`}>{newUserSuccess}</div>}
                {newUserError && <div className={`${styles.alert} ${styles.alertError}`}>{newUserError}</div>}

                <form onSubmit={handleAdminCreateUser} style={{ marginTop: "1rem" }}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Nombre Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Santiago Ambadjian"
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
                      placeholder="santiago@operaprimaproducciones.com"
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
                    <label className={styles.formLabel}>Rol administrativo</label>
                    <select
                      className={styles.formInput}
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      style={{ background: "#0a0a0a" }}
                    >
                      <option value="user">Usuario regular</option>
                      <option value="admin">Administrador (Completo)</option>
                    </select>
                  </div>

                  <button type="submit" disabled={newUserLoading} className={styles.submitBtn}>
                    {newUserLoading ? "Registrando..." : "Crear Usuario"}
                  </button>
                </form>
              </div>

              {/* Users List Table Panel */}
              <div className={styles.panel}>
                <h2 className={styles.panelTitle}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  Usuarios Registrados
                </h2>

                {usersLoading ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⏳</div>
                    <p>Cargando lista de usuarios...</p>
                  </div>
                ) : usersList.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No hay usuarios.</p>
                  </div>
                ) : (
                  <div className={styles.tableResponsive}>
                    <table className={styles.userTable}>
                      <thead>
                        <tr>
                          <th>Nombre</th>
                          <th>Email</th>
                          <th>Rol</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usersList.map((usr) => (
                          <tr key={usr.id}>
                            <td>
                              <strong>{usr.name || "Sin nombre"}</strong>
                            </td>
                            <td>{usr.email}</td>
                            <td>
                              <span className={`${styles.roleBadge} ${usr.role === "admin" ? styles.roleAdmin : styles.roleUser}`}>
                                {usr.role}
                              </span>
                            </td>
                            <td>
                              {usr.id !== user.id ? (
                                <button
                                  onClick={() => handleDeleteUser(usr.id)}
                                  className={styles.deleteBtn}
                                  title="Eliminar usuario"
                                >
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  </svg>
                                  Eliminar
                                </button>
                              ) : (
                                <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>Tú mismo</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: CONTENT MANAGEMENT (LANDING / SHOWS) */}
        {activeSection === "landing" && (
          <div className={styles.sectionContainer}>
            <div className={styles.contentHeader}>
              <div>
                <h1 className={styles.sectionTitle}>Editor de Landing Page</h1>
                <p className={styles.sectionSubtitle}>Maneja el banner principal (carrusel) y el catálogo de espectáculos</p>
              </div>
            </div>

            <div className={styles.cmsGrid}>
              
              {/* Shows Left List Panel */}
              <div className={styles.cmsListPane}>
                <div className={styles.panel}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 className={styles.panelTitle} style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
                      Espectáculos y Banners
                    </h2>
                    
                    {user.role === "admin" && (
                      <button
                        onClick={() => {
                          setSelectedShow(null);
                          setShowFormMode("create");
                        }}
                        className={styles.submitBtn}
                        style={{ width: "auto", fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                      >
                        + Añadir Obra
                      </button>
                    )}
                  </div>

                  {showsLoading ? (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIcon}>⏳</div>
                      <p>Cargando espectáculos...</p>
                    </div>
                  ) : shows.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>No se encontraron espectáculos registrados.</p>
                    </div>
                  ) : (
                    <div className={styles.showList}>
                      {shows.map((shw) => (
                        <div
                          key={shw.id}
                          onClick={() => {
                            setSelectedShow(shw);
                            setShowFormMode("edit");
                          }}
                          className={`${styles.showItem} ${selectedShow?.id === shw.id && showFormMode === "edit" ? styles.showItemActive : ""}`}
                        >
                          <div
                            className={styles.showThumbnail}
                            style={{ backgroundImage: `url(${shw.image})` }}
                          />
                          <div className={styles.showTextMeta}>
                            <div className={styles.showTypeRow}>
                              <span className={`${styles.badge} ${shw.type === "billboard" ? styles.badgeSent : styles.badgeReceived}`}>
                                {shw.type === "billboard" ? "Hero Slider" : "Catálogo"}
                              </span>
                              {shw.category && <span className={styles.showCategoryBadge}>{shw.category}</span>}
                            </div>
                            <span className={styles.showItemTitle}>{shw.title}</span>
                            <span className={styles.showItemComposer}>{shw.composer}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Show Form Right Panel */}
              <div className={styles.cmsFormPane}>
                
                {showFormMode !== "closed" && (
                  <div className={styles.panel}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.75rem", marginBottom: "1.5rem" }}>
                      <h2 className={styles.panelTitle} style={{ borderBottom: "none", paddingBottom: 0, marginBottom: 0 }}>
                        {showFormMode === "edit" ? "Editar Obra" : "Nueva Obra"}
                      </h2>
                      
                      {showFormMode === "edit" && selectedShow && user.role === "admin" && (
                        <button
                          onClick={() => handleDeleteShow(selectedShow.id)}
                          className={styles.deleteBtn}
                        >
                          Eliminar Obra
                        </button>
                      )}
                    </div>

                    {showFormSuccess && <div className={`${styles.alert} ${styles.alertSuccess}`}>{showFormSuccess}</div>}
                    {showFormError && <div className={`${styles.alert} ${styles.alertError}`}>{showFormError}</div>}

                    {user.role !== "admin" && (
                      <p className={styles.formHint} style={{ color: "var(--camel)" }}>
                        * Modo lectura. Los usuarios regulares no pueden modificar el contenido de la web.
                      </p>
                    )}

                    <form onSubmit={handleSaveShow}>
                      <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Título</label>
                          <input
                            type="text"
                            required
                            disabled={user.role !== "admin"}
                            placeholder="Nombre de la Obra"
                            className={styles.formInput}
                            value={showTitle}
                            onChange={(e) => setShowTitle(e.target.value)}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Compositor / Director</label>
                          <input
                            type="text"
                            required
                            disabled={user.role !== "admin"}
                            placeholder="Giuseppe Verdi"
                            className={styles.formInput}
                            value={showComposer}
                            onChange={(e) => setShowComposer(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.formGrid2}>
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Ubicación en la Web (Tipo)</label>
                          <select
                            disabled={user.role !== "admin"}
                            className={styles.formInput}
                            value={showType}
                            onChange={(e) => setShowType(e.target.value)}
                            style={{ background: "#0a0a0a" }}
                          >
                            <option value="billboard">Carrusel Principal (Banner arriba)</option>
                            <option value="calendar">Catálogo / Grilla (Temporada abajo)</option>
                          </select>
                        </div>

                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Ruta de la Imagen</label>
                          <input
                            type="text"
                            required
                            disabled={user.role !== "admin"}
                            placeholder="/images/hero_carmen.png"
                            className={styles.formInput}
                            value={showImage}
                            onChange={(e) => setShowImage(e.target.value)}
                          />
                        </div>
                      </div>

                      {showType === "billboard" ? (
                        <div className={styles.formGroup}>
                          <label className={styles.formLabel}>Etiqueta Especial</label>
                          <input
                            type="text"
                            disabled={user.role !== "admin"}
                            placeholder="ÓPERA PRINCIPAL"
                            className={styles.formInput}
                            value={showTag}
                            onChange={(e) => setShowTag(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className={styles.formGrid3}>
                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Categoría</label>
                            <select
                              disabled={user.role !== "admin"}
                              className={styles.formInput}
                              value={showCategory}
                              onChange={(e) => setShowCategory(e.target.value)}
                              style={{ background: "#0a0a0a" }}
                            >
                              <option value="opera">Ópera</option>
                              <option value="ballet">Ballet</option>
                              <option value="concierto">Concierto</option>
                              <option value="infantil">Infantil</option>
                            </select>
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Fechas</label>
                            <input
                              type="text"
                              disabled={user.role !== "admin"}
                              placeholder="Mayo 30 - Junio 5"
                              className={styles.formInput}
                              value={showDates}
                              onChange={(e) => setShowDates(e.target.value)}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Precio Entrada</label>
                            <input
                              type="text"
                              disabled={user.role !== "admin"}
                              placeholder="$4.000"
                              className={styles.formInput}
                              value={showPrice}
                              onChange={(e) => setShowPrice(e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Descripción breve</label>
                        <textarea
                          required
                          disabled={user.role !== "admin"}
                          placeholder="Sinopsis o detalles de la obra..."
                          className={styles.formTextarea}
                          value={showDesc}
                          onChange={(e) => setShowDesc(e.target.value)}
                        />
                      </div>

                      {user.role === "admin" && (
                        <button type="submit" disabled={showFormLoading} className={styles.submitBtn}>
                          {showFormLoading ? "Guardando..." : "Guardar Espectáculo"}
                        </button>
                      )}
                    </form>
                  </div>
                )}

                {showFormMode === "closed" && (
                  <div className={styles.emptyState} style={{ background: "var(--glass-bg)", borderRadius: "12px" }}>
                    <div className={styles.emptyIcon}>🎬</div>
                    <p>Selecciona una obra de la lista para verla o editarla.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
