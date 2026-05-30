"use client";

import React, { useState, useEffect } from "react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShow: string;
}

interface Seat {
  id: string;
  row: string;
  number: number;
  tier: "Platea" | "Palcos" | "Tertulia" | "Paraíso";
  price: number;
  status: "available" | "selected" | "sold";
}

const TIER_CONFIG = {
  Platea: { price: 12000, color: "var(--camel)" },
  Palcos: { price: 18000, color: "var(--dark-amaranth)" },
  Tertulia: { price: 8000, color: "var(--smoky-rose)" },
  Paraíso: { price: 4000, color: "rgba(241, 233, 218, 0.4)" },
};

const SHOW_DATES: Record<string, string[]> = {
  "Carmen": ["Sábado 30 de Mayo - 20:00", "Martes 2 de Junio - 19:30", "Viernes 5 de Junio - 20:00"],
  "La Traviata": ["Jueves 11 de Junio - 20:00", "Domingo 14 de Junio - 17:00", "Miércoles 17 de Junio - 19:30"],
  "El Lago de los Cisnes": ["Viernes 26 de Junio - 20:30", "Sábado 27 de Junio - 20:30", "Domingo 28 de Junio - 18:00"],
};

export default function TicketModal({ isOpen, onClose, initialShow }: TicketModalProps) {
  const [selectedShow, setSelectedShow] = useState(initialShow);
  const [selectedDate, setSelectedDate] = useState("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<"seats" | "details" | "success">("seats");
  
  // Checkout Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Initialize dates and seats
  useEffect(() => {
    if (isOpen) {
      setSelectedShow(initialShow);
      const dates = SHOW_DATES[initialShow] || [];
      setSelectedDate(dates[0] || "");
      generateSeatingMap();
      setSelectedSeats([]);
      setStep("seats");
      
      // Clear form
      setName("");
      setEmail("");
      setCard("");
      setExpiry("");
      setCvv("");
    }
  }, [isOpen, initialShow]);

  // Sync date when show changes
  useEffect(() => {
    const dates = SHOW_DATES[selectedShow] || [];
    setSelectedDate(dates[0] || "");
    generateSeatingMap();
    setSelectedSeats([]);
  }, [selectedShow]);

  const generateSeatingMap = () => {
    const newSeats: Seat[] = [];

    // 1. Platea (Rows A, B, C, D)
    const plateaRows = ["A", "B", "C", "D"];
    plateaRows.forEach((row) => {
      for (let number = 1; number <= 8; number++) {
        // Randomly set ~25% as sold
        const isSold = Math.random() < 0.25;
        newSeats.push({
          id: `platea-${row}-${number}`,
          row,
          number,
          tier: "Platea",
          price: TIER_CONFIG.Platea.price,
          status: isSold ? "sold" : "available",
        });
      }
    });

    // 2. Palcos (Left Side Boxes, Right Side Boxes)
    const palcos = ["Box 1 (Izq)", "Box 2 (Izq)", "Box 3 (Der)", "Box 4 (Der)"];
    palcos.forEach((box) => {
      for (let number = 1; number <= 3; number++) {
        const isSold = Math.random() < 0.3;
        newSeats.push({
          id: `palco-${box}-${number}`,
          row: box,
          number,
          tier: "Palcos",
          price: TIER_CONFIG.Palcos.price,
          status: isSold ? "sold" : "available",
        });
      }
    });

    // 3. Tertulia (Rows E, F)
    const tertuliaRows = ["E", "F"];
    tertuliaRows.forEach((row) => {
      for (let number = 1; number <= 10; number++) {
        const isSold = Math.random() < 0.2;
        newSeats.push({
          id: `tertulia-${row}-${number}`,
          row,
          number,
          tier: "Tertulia",
          price: TIER_CONFIG.Tertulia.price,
          status: isSold ? "sold" : "available",
        });
      }
    });

    // 4. Paraíso (Rows G, H)
    const paraisoRows = ["G", "H"];
    paraisoRows.forEach((row) => {
      for (let number = 1; number <= 12; number++) {
        const isSold = Math.random() < 0.4;
        newSeats.push({
          id: `paraiso-${row}-${number}`,
          row,
          number,
          tier: "Paraíso",
          price: TIER_CONFIG.Paraíso.price,
          status: isSold ? "sold" : "available",
        });
      }
    });

    setSeats(newSeats);
  };

  const handleSeatClick = (clickedSeat: Seat) => {
    if (clickedSeat.status === "sold") return;

    const newSeats = seats.map((seat) => {
      if (seat.id === clickedSeat.id) {
        const newStatus = seat.status === "selected" ? "available" : "selected";
        return { ...seat, status: newStatus as "available" | "selected" };
      }
      return seat;
    });

    setSeats(newSeats);

    const seatInCart = selectedSeats.find((s) => s.id === clickedSeat.id);
    if (seatInCart) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== clickedSeat.id));
    } else {
      setSelectedSeats([...selectedSeats, { ...clickedSeat, status: "selected" }]);
    }
  };

  const handleNextStep = () => {
    if (selectedSeats.length === 0) return;
    setStep("details");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !card) return;
    setStep("success");
  };

  const totalCost = selectedSeats.reduce((acc, curr) => acc + curr.price, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade">
      {/* Container Card */}
      <div 
        className="glass-panel w-full max-w-5xl h-[90vh] md:h-[80vh] flex flex-col md:flex-row overflow-hidden border border-[rgba(186,154,99,0.3)] shadow-[0_0_50px_rgba(115,28,43,0.4)] bg-[rgba(10,2,3,0.95)]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {/* Left Side: Show Info & Ticket summary (Glassy backdrop) */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[rgba(186,154,99,0.15)] p-6 flex flex-col gap-6 bg-gradient-to-b from-[rgba(115,28,43,0.1)] to-transparent shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--camel)] font-bold">
              BOLETERÍA OFICIAL
            </span>
            <h2 className="text-2xl font-serif font-bold text-[var(--eggshell)] mt-1">
              Comprar Entradas
            </h2>
          </div>

          {/* Show Selection */}
          {step === "seats" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                  Obra
                </label>
                <select
                  value={selectedShow}
                  onChange={(e) => setSelectedShow(e.target.value)}
                  className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] rounded p-2 text-sm text-[var(--eggshell)] outline-none focus:border-[var(--camel)]"
                >
                  <option value="Carmen">Carmen (Ópera)</option>
                  <option value="La Traviata">La Traviata (Ópera)</option>
                  <option value="El Lago de los Cisnes">El Lago de los Cisnes (Ballet)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                  Función
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] rounded p-2 text-sm text-[var(--eggshell)] outline-none focus:border-[var(--camel)]"
                >
                  {(SHOW_DATES[selectedShow] || []).map((date, idx) => (
                    <option key={idx} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            // Static selection overview
            <div className="flex flex-col gap-2 bg-[rgba(115,28,43,0.15)] border border-[rgba(186,154,99,0.15)] rounded-lg p-4">
              <h4 className="text-sm font-serif font-semibold text-[var(--camel)]">
                {selectedShow}
              </h4>
              <p className="text-xs text-[var(--eggshell)]/85">
                {selectedDate}
              </p>
              <p className="text-[10px] text-[var(--smoky-rose)]">
                Teatro Principal Opera Prima
              </p>
            </div>
          )}

          {/* Pricing Info Tiers */}
          {step === "seats" && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-bold">
                Categorías de Butacas
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--camel)] inline-block" />
                  <div>
                    <p className="font-medium text-[var(--eggshell)]">Platea</p>
                    <p className="text-[10px] text-[var(--smoky-rose)]">$12.000</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--dark-amaranth)] inline-block border border-[rgba(186,154,99,0.3)]" />
                  <div>
                    <p className="font-medium text-[var(--eggshell)]">Palcos</p>
                    <p className="text-[10px] text-[var(--smoky-rose)]">$18.000</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--smoky-rose)] inline-block" />
                  <div>
                    <p className="font-medium text-[var(--eggshell)]">Tertulia</p>
                    <p className="text-[10px] text-[var(--smoky-rose)]">$8.000</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600 inline-block" />
                  <div>
                    <p className="font-medium text-[var(--eggshell)]">Paraíso</p>
                    <p className="text-[10px] text-[var(--smoky-rose)]">$4.000</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selection Cart Summary */}
          <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(186,154,99,0.15)] pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--smoky-rose)]">Butacas:</span>
              <span className="font-bold text-[var(--eggshell)]">{selectedSeats.length}</span>
            </div>
            
            {/* List of seats selected */}
            {selectedSeats.length > 0 && (
              <div className="max-h-20 overflow-y-auto flex flex-wrap gap-1 pr-1 custom-scrollbar">
                {selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded bg-[rgba(186,154,99,0.15)] border border-[rgba(186,154,99,0.3)] text-[var(--camel)]"
                  >
                    Fila {seat.row}-{seat.number} ({seat.tier})
                  </span>
                ))}
              </div>
            )}

            <div className="flex justify-between items-end border-t border-dashed border-[rgba(186,154,99,0.1)] pt-2">
              <span className="text-xs text-[var(--smoky-rose)]">Total:</span>
              <span className="text-xl font-bold font-serif text-[var(--camel)]">
                ${totalCost.toLocaleString("es-AR")}
              </span>
            </div>

            {step === "seats" && (
              <button
                disabled={selectedSeats.length === 0}
                onClick={handleNextStep}
                className="w-full btn-primary disabled:opacity-40 disabled:pointer-events-none text-center py-3 flex items-center justify-center font-medium mt-2"
              >
                Continuar
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Dynamic workflow (Booking Grid or Form or Success Card) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[rgba(15,3,5,0.4)]">
          {/* Top header navigation */}
          <div className="flex items-center justify-between p-6 pb-2 border-b border-[rgba(186,154,99,0.1)]">
            <div className="flex gap-4 text-xs font-semibold text-[var(--smoky-rose)]">
              <span className={step === "seats" ? "text-[var(--camel)] border-b border-[var(--camel)] pb-1" : ""}>
                1. Selección
              </span>
              <span className={step === "details" ? "text-[var(--camel)] border-b border-[var(--camel)] pb-1" : ""}>
                2. Pago
              </span>
              <span className={step === "success" ? "text-[var(--camel)] border-b border-[var(--camel)] pb-1" : ""}>
                3. Confirmación
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-lg text-[var(--smoky-rose)] hover:text-[var(--eggshell)] transition-colors p-2"
              aria-label="Cerrar boletería"
            >
              ✕
            </button>
          </div>

          {/* Core Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 flex items-center justify-center">
            
            {/* STEP 1: Seating map selection */}
            {step === "seats" && (
              <div className="w-full max-w-2xl flex flex-col gap-8 items-center justify-center py-4">
                
                {/* Opera Stage Representation */}
                <div className="w-full flex flex-col items-center gap-1.5 relative mb-4">
                  <div 
                    className="w-4/5 h-8 border-b-2 border-[var(--camel)] rounded-[50%/0_0_100%_100%] flex items-center justify-center shadow-[0_4px_12px_rgba(186,154,99,0.2)]"
                    style={{ background: "linear-gradient(to bottom, transparent, rgba(115,28,43,0.15))" }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--camel)] font-bold">
                      ESCENARIO
                    </span>
                  </div>
                  {/* Foso de la Orquesta */}
                  <div className="w-3/5 h-3 border-b border-[rgba(186,154,99,0.2)] rounded-[50%/0_0_100%_100%] bg-black/40 flex items-center justify-center">
                    <span className="text-[7px] uppercase tracking-[0.25em] text-[var(--smoky-rose)]">
                      Orquesta Filarmónica
                    </span>
                  </div>
                </div>

                {/* Theater Seating Grid */}
                <div className="flex flex-col gap-5 items-center w-full select-none">
                  
                  {/* TIER 1: Platea (Rows A, B, C, D) */}
                  <div className="flex flex-col gap-2.5 items-center w-full">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--camel)] font-bold">
                      Platea
                    </span>
                    {["A", "B", "C", "D"].map((row) => (
                      <div key={row} className="flex gap-2 items-center">
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                        <div className="flex gap-1.5">
                          {seats
                            .filter((s) => s.tier === "Platea" && s.row === row)
                            .map((seat) => (
                              <button
                                key={seat.id}
                                disabled={seat.status === "sold"}
                                onClick={() => handleSeatClick(seat)}
                                className={`w-6 h-6 rounded-full text-[8px] font-semibold flex items-center justify-center border transition-all duration-200 ${
                                  seat.status === "sold"
                                    ? "bg-neutral-800/80 border-neutral-700/50 text-neutral-600 cursor-not-allowed"
                                    : seat.status === "selected"
                                    ? "bg-[var(--camel)] border-[var(--camel)] text-[#0c0204] scale-110 shadow-[0_0_10px_rgba(186,154,99,0.4)]"
                                    : "bg-transparent border-[rgba(186,154,99,0.4)] text-[var(--eggshell)] hover:bg-[rgba(186,154,99,0.1)] hover:border-[var(--camel)]"
                                }`}
                                title={`Platea - Fila ${seat.row}, Asiento ${seat.number} ($12.000)`}
                              >
                                {seat.number}
                              </button>
                            ))}
                        </div>
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TIER 2: Palcos (Left Side / Right Side Box style) */}
                  <div className="flex justify-between items-center w-full max-w-md my-1">
                    {/* Left Palcos */}
                    <div className="flex flex-col gap-2.5 border-r border-[rgba(186,154,99,0.15)] pr-4">
                      <span className="text-[8px] uppercase tracking-wider text-[var(--camel)] font-bold text-left">
                        Palcos Izq
                      </span>
                      {["Box 1 (Izq)", "Box 2 (Izq)"].map((box) => (
                        <div key={box} className="flex gap-2 items-center">
                          <span className="text-[8px] text-[var(--smoky-rose)] w-10 truncate font-semibold">
                            {box.split(" ")[0]} {box.split(" ")[1]}
                          </span>
                          <div className="flex gap-1">
                            {seats
                              .filter((s) => s.tier === "Palcos" && s.row === box)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  disabled={seat.status === "sold"}
                                  onClick={() => handleSeatClick(seat)}
                                  className={`w-5 h-5 rounded-md text-[7px] font-bold flex items-center justify-center border transition-all duration-200 ${
                                    seat.status === "sold"
                                      ? "bg-neutral-800 border-neutral-700/50 text-neutral-600 cursor-not-allowed"
                                      : seat.status === "selected"
                                      ? "bg-[var(--dark-amaranth)] border-[var(--camel)] text-[var(--eggshell)] scale-110 shadow-[0_0_10px_rgba(115,28,43,0.5)]"
                                      : "bg-transparent border-[rgba(115,28,43,0.5)] text-[var(--eggshell)] hover:bg-[rgba(115,28,43,0.15)]"
                                  }`}
                                  title={`Palco - ${seat.row}, Asiento ${seat.number} ($18.000)`}
                                >
                                  {seat.number}
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Right Palcos */}
                    <div className="flex flex-col gap-2.5 border-l border-[rgba(186,154,99,0.15)] pl-4 items-end">
                      <span className="text-[8px] uppercase tracking-wider text-[var(--camel)] font-bold text-right">
                        Palcos Der
                      </span>
                      {["Box 3 (Der)", "Box 4 (Der)"].map((box) => (
                        <div key={box} className="flex gap-2 items-center">
                          <div className="flex gap-1">
                            {seats
                              .filter((s) => s.tier === "Palcos" && s.row === box)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  disabled={seat.status === "sold"}
                                  onClick={() => handleSeatClick(seat)}
                                  className={`w-5 h-5 rounded-md text-[7px] font-bold flex items-center justify-center border transition-all duration-200 ${
                                    seat.status === "sold"
                                      ? "bg-neutral-800 border-neutral-700/50 text-neutral-600 cursor-not-allowed"
                                      : seat.status === "selected"
                                      ? "bg-[var(--dark-amaranth)] border-[var(--camel)] text-[var(--eggshell)] scale-110 shadow-[0_0_10px_rgba(115,28,43,0.5)]"
                                      : "bg-transparent border-[rgba(115,28,43,0.5)] text-[var(--eggshell)] hover:bg-[rgba(115,28,43,0.15)]"
                                  }`}
                                  title={`Palco - ${seat.row}, Asiento ${seat.number} ($18.000)`}
                                >
                                  {seat.number}
                                </button>
                              ))}
                          </div>
                          <span className="text-[8px] text-[var(--smoky-rose)] w-10 truncate font-semibold text-right">
                            {box.split(" ")[0]} {box.split(" ")[1]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TIER 3: Tertulia (Balcony) */}
                  <div className="flex flex-col gap-2.5 items-center w-full">
                    <span className="text-[9px] uppercase tracking-wider text-[var(--smoky-rose)] font-bold">
                      Tertulia (Balcón)
                    </span>
                    {["E", "F"].map((row) => (
                      <div key={row} className="flex gap-2 items-center">
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                        <div className="flex gap-1">
                          {seats
                            .filter((s) => s.tier === "Tertulia" && s.row === row)
                            .map((seat) => (
                              <button
                                key={seat.id}
                                disabled={seat.status === "sold"}
                                onClick={() => handleSeatClick(seat)}
                                className={`w-5.5 h-5.5 rounded-full text-[7.5px] font-semibold flex items-center justify-center border transition-all duration-200 ${
                                  seat.status === "sold"
                                    ? "bg-neutral-800/80 border-neutral-700/50 text-neutral-600 cursor-not-allowed"
                                    : seat.status === "selected"
                                    ? "bg-[var(--smoky-rose)] border-[var(--smoky-rose)] text-[#0c0204] scale-110 shadow-[0_0_10px_rgba(156,95,93,0.5)]"
                                    : "bg-transparent border-[rgba(156,95,93,0.4)] text-[var(--eggshell)] hover:bg-[rgba(156,95,93,0.15)]"
                                }`}
                                title={`Tertulia - Fila ${seat.row}, Asiento ${seat.number} ($8.000)`}
                              >
                                {seat.number}
                              </button>
                            ))}
                        </div>
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* TIER 4: Paraíso (Upper Gallery) */}
                  <div className="flex flex-col gap-2.5 items-center w-full">
                    <span className="text-[9px] uppercase tracking-wider text-[rgba(241,233,218,0.4)] font-bold">
                      Paraíso (Galería Alta)
                    </span>
                    {["G", "H"].map((row) => (
                      <div key={row} className="flex gap-2 items-center">
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                        <div className="flex gap-0.5">
                          {seats
                            .filter((s) => s.tier === "Paraíso" && s.row === row)
                            .map((seat) => (
                              <button
                                key={seat.id}
                                disabled={seat.status === "sold"}
                                onClick={() => handleSeatClick(seat)}
                                className={`w-5 h-5 rounded-full text-[7px] font-semibold flex items-center justify-center border transition-all duration-200 ${
                                  seat.status === "sold"
                                    ? "bg-neutral-800/80 border-neutral-700/50 text-neutral-600 cursor-not-allowed"
                                    : seat.status === "selected"
                                    ? "bg-[var(--eggshell)] border-[var(--eggshell)] text-[#0c0204] scale-110 shadow-[0_0_10px_rgba(241,233,218,0.5)]"
                                    : "bg-transparent border-neutral-700 text-neutral-400 hover:border-neutral-500 hover:bg-neutral-800/30"
                                }`}
                                title={`Paraíso - Fila ${seat.row}, Asiento ${seat.number} ($4.000)`}
                              >
                                {seat.number}
                              </button>
                            ))}
                        </div>
                        <span className="text-[9px] text-[var(--smoky-rose)] w-4 font-bold text-center">
                          {row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Checkout details Form */}
            {step === "details" && (
              <div className="w-full max-w-md animate-fade flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[var(--camel)] mb-1">
                    Detalles de Facturación
                  </h3>
                  <p className="text-xs text-[var(--smoky-rose)]">
                    Completa la información para emitir tus entradas virtuales simuladas.
                  </p>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Nicolas García"
                      className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] focus:border-[var(--camel)] rounded p-2.5 text-sm text-[var(--eggshell)] outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. nicolas@ejemplo.com"
                      className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] focus:border-[var(--camel)] rounded p-2.5 text-sm text-[var(--eggshell)] outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                      Tarjeta de Crédito / Débito (MOCK)
                    </label>
                    <input
                      type="text"
                      required
                      value={card}
                      onChange={(e) => setCard(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="4500 0000 0000 0000"
                      className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] focus:border-[var(--camel)] rounded p-2.5 text-sm text-[var(--eggshell)] outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value.slice(0, 5))}
                        placeholder="MM/AA"
                        className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] focus:border-[var(--camel)] rounded p-2.5 text-sm text-[var(--eggshell)] outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase tracking-wider text-[var(--smoky-rose)] font-semibold">
                        CVV
                      </label>
                      <input
                        type="password"
                        required
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="***"
                        className="w-full bg-[rgba(20,4,6,0.8)] border border-[rgba(186,154,99,0.2)] focus:border-[var(--camel)] rounded p-2.5 text-sm text-[var(--eggshell)] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setStep("seats")}
                      className="flex-1 btn-secondary text-center py-3 text-sm font-semibold"
                    >
                      Volver
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary text-center py-3 text-sm font-semibold"
                    >
                      Pagar
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: Order Completed (Success Card) */}
            {step === "success" && (
              <div className="w-full max-w-lg animate-fade flex flex-col gap-6 items-center text-center">
                
                {/* Large animated green check badge */}
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-bounce">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-serif font-bold text-[var(--camel)]">
                    ¡Entradas Confirmadas!
                  </h3>
                  <p className="text-sm text-[var(--eggshell)]/85 px-4">
                    Estimado/a <span className="font-semibold text-white">{name}</span>, tu reserva simulada se ha completado con éxito. Se ha enviado un correo a <span className="text-white font-medium">{email}</span> con los boletos electrónicos.
                  </p>
                </div>

                {/* Simulated Luxury Opera Ticket Slip */}
                <div 
                  className="w-full border border-[rgba(186,154,99,0.35)] rounded-xl bg-[rgba(115,28,43,0.15)] flex flex-col overflow-hidden relative shadow-xl"
                  style={{ backgroundImage: "var(--bg-spotlight)" }}
                >
                  {/* Dotted division line on side for tickets */}
                  <div className="absolute top-0 bottom-0 left-3/4 border-l border-dashed border-[rgba(186,154,99,0.3)]" />
                  
                  {/* Circle punctures on side */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[rgba(15,3,5,1)] border border-[rgba(186,154,99,0.3)]" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[rgba(15,3,5,1)] border border-[rgba(186,154,99,0.3)]" />

                  {/* Main Ticket body */}
                  <div className="flex p-5 gap-4">
                    <div className="flex-1 flex flex-col gap-3 text-left">
                      <div>
                        <span className="text-[7px] uppercase tracking-wider text-[var(--camel)] font-bold">
                          ÓPERA PRIMA COMPAÑÍA LÍRICA
                        </span>
                        <h4 className="text-base font-serif font-bold text-[var(--eggshell)] mt-0.5">
                          {selectedShow}
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]">
                        <div>
                          <p className="text-[var(--smoky-rose)] uppercase font-semibold text-[8px] tracking-wide">Función</p>
                          <p className="text-[var(--eggshell)] truncate">{selectedDate.split(" - ")[0]}</p>
                        </div>
                        <div>
                          <p className="text-[var(--smoky-rose)] uppercase font-semibold text-[8px] tracking-wide">Hora</p>
                          <p className="text-[var(--eggshell)]">{selectedDate.split(" - ")[1] || "20:00"}</p>
                        </div>
                        <div>
                          <p className="text-[var(--smoky-rose)] uppercase font-semibold text-[8px] tracking-wide">Sala</p>
                          <p className="text-[var(--eggshell)]">Teatro Principal</p>
                        </div>
                        <div>
                          <p className="text-[var(--smoky-rose)] uppercase font-semibold text-[8px] tracking-wide">Butacas</p>
                          <p className="text-[var(--camel)] font-bold">
                            {selectedSeats.map((s) => `${s.row}-${s.number}`).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stub body */}
                    <div className="w-1/4 pl-4 flex flex-col justify-between items-center text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[6px] text-[var(--smoky-rose)] uppercase font-semibold tracking-wider">
                          Ticket ID
                        </span>
                        <span className="text-[9px] font-bold text-[var(--camel)] uppercase mt-0.5">
                          OP-{Math.floor(1000 + Math.random() * 9000)}
                        </span>
                      </div>
                      
                      {/* Mock barcode SVG/CSS */}
                      <div className="w-10 h-10 bg-white p-1 rounded-sm flex items-center justify-center shrink-0 shadow-lg">
                        {/* Styled QR code representation */}
                        <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black via-black to-neutral-900 grid grid-cols-4 grid-rows-4 gap-0.5">
                          <div className="bg-black col-span-2 row-span-2" />
                          <div className="bg-white" />
                          <div className="bg-black" />
                          <div className="bg-white" />
                          <div className="bg-black" />
                          <div className="bg-black" />
                          <div className="bg-white" />
                          <div className="bg-black col-span-2 row-span-2" />
                        </div>
                      </div>
                      <span className="text-[6px] text-[var(--smoky-rose)] font-light">
                        Admisión
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="btn-secondary w-full max-w-xs text-center py-2.5 mt-2 text-sm font-semibold"
                >
                  Cerrar Boletería
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
