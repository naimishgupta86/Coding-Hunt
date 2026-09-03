import { useState } from "react";
import "./RoundManagement.css";
import {
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Target,
  Crown,
  Zap,
  Clock,
  MapPin,
  KeyRound,
  CheckCircle,
  Save,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function RoundManagement() {
  const navigate = useNavigate();

  const [rounds, setRounds] = useState([
    {
      id: 1,
      roundNumber: 1,
      name: "The Beginning",
      type: "Normal",
      question: "What is the output of 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "4",
      points: 100,
      difficulty: "Easy",
      timer: 300,
      clue: "Think about basic arithmetic.",
      location: "Main Building",
      halfCode: "CH01",
      active: true,
      bossLevel: false,
      powerEnabled: false,
      power: "None",
      powerEffect: "",
      powerDuration: 0,
      requiredLives: 1,
      bonusPoints: 0,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingRound, setEditingRound] = useState(null);

  const emptyRound = {
    roundNumber: rounds.length + 1,
    name: "",
    type: "Normal",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    points: 100,
    difficulty: "Medium",
    timer: 300,
    clue: "",
    location: "",
    halfCode: "",
    active: true,
    bossLevel: false,
    powerEnabled: false,
    power: "Shield",
    powerEffect: "",
    powerDuration: 30,
    requiredLives: 1,
    bonusPoints: 0,
  };

  const [form, setForm] = useState(emptyRound);

  const openAddForm = () => {
    setEditingRound(null);
    setForm({
      ...emptyRound,
      roundNumber: rounds.length + 1,
    });
    setShowForm(true);
  };

  const openEditForm = (round) => {
    setEditingRound(round.id);
    setForm({
      ...round,
      options: [...round.options],
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRound(null);
    setForm(emptyRound);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => {
      const updatedOptions = [...prev.options];
      updatedOptions[index] = value;

      return {
        ...prev,
        options: updatedOptions,
      };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.question ||
      form.options.some((option) => !option) ||
      !form.correctAnswer ||
      !form.clue ||
      !form.location ||
      !form.halfCode
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (!form.options.includes(form.correctAnswer)) {
      alert("Correct Answer must match one of the options.");
      return;
    }

    const formattedRound = {
      ...form,
      id: editingRound || Date.now(),
      roundNumber: Number(form.roundNumber),
      points: Number(form.points),
      timer: Number(form.timer),
      powerDuration: Number(form.powerDuration),
      requiredLives: Number(form.requiredLives),
      bonusPoints: Number(form.bonusPoints),
    };

    if (editingRound) {
      setRounds((prev) =>
        prev.map((round) =>
          round.id === editingRound ? formattedRound : round
        )
      );
    } else {
      setRounds((prev) => [...prev, formattedRound]);
    }

    closeForm();
  };

  const deleteRound = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this round?"
    );

    if (!confirmed) return;

    setRounds((prev) => prev.filter((round) => round.id !== id));
  };

  const toggleActive = (id) => {
    setRounds((prev) =>
      prev.map((round) =>
        round.id === id
          ? {
              ...round,
              active: !round.active,
            }
          : round
      )
    );
  };

  const getPowerIcon = () => {
    return <Zap size={18} />;
  };

  return (
    <div className="round-management">
      {/* NAVBAR */}

      <nav className="admin-navbar">
        <div className="admin-nav-brand">
          <div className="admin-nav-icon">
            <Target size={22} />
          </div>

          <div>
            <h2>
              CODING <span>HUNT</span>
            </h2>
            <p>ADMIN CONTROL CENTER</p>
          </div>
        </div>

        <button
          className="round-back-btn"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft size={17} />
          BACK TO DASHBOARD
        </button>
      </nav>

      {/* HEADER */}

      <section className="round-management-header">
        <div>
          <p className="admin-label">ROUND MANAGEMENT</p>

          <h1>Hunt Round Configuration</h1>

          <p>
            Configure questions, clues, locations, timers, boss levels and
            special powers.
          </p>
        </div>

        <button className="add-round-btn" onClick={openAddForm}>
          <Plus size={18} />
          ADD ROUND
        </button>
      </section>

      {/* SUMMARY */}

      <section className="round-summary">
        <div className="round-summary-card">
          <Target size={21} />

          <div>
            <small>TOTAL ROUNDS</small>
            <strong>{rounds.length}</strong>
          </div>
        </div>

        <div className="round-summary-card">
          <Crown size={21} />

          <div>
            <small>BOSS LEVELS</small>
            <strong>
              {rounds.filter((round) => round.bossLevel).length}
            </strong>
          </div>
        </div>

        <div className="round-summary-card">
          <Zap size={21} />

          <div>
            <small>POWER ROUNDS</small>
            <strong>
              {rounds.filter((round) => round.powerEnabled).length}
            </strong>
          </div>
        </div>

        <div className="round-summary-card">
          <CheckCircle size={21} />

          <div>
            <small>ACTIVE ROUNDS</small>
            <strong>
              {rounds.filter((round) => round.active).length}
            </strong>
          </div>
        </div>
      </section>

      {/* ROUND LIST */}

      <section className="round-list-section">
        <div className="round-list-heading">
          <div>
            <p className="admin-label">CONFIGURED ROUNDS</p>
            <h2>All Hunt Rounds</h2>
          </div>

          <span>{rounds.length} Rounds</span>
        </div>

        <div className="round-list">
          {rounds.length === 0 ? (
            <div className="empty-rounds">
              <Target size={40} />
              <h3>No rounds configured</h3>
              <p>Add your first round to start configuring the hunt.</p>

              <button onClick={openAddForm}>
                <Plus size={17} />
                ADD FIRST ROUND
              </button>
            </div>
          ) : (
            rounds
              .sort((a, b) => a.roundNumber - b.roundNumber)
              .map((round) => (
                <div className="round-admin-card" key={round.id}>
                  {/* TOP */}

                  <div className="round-admin-top">
                    <div className="round-admin-number">
                      {String(round.roundNumber).padStart(2, "0")}
                    </div>

                    <div className="round-admin-title">
                      <div className="round-title-row">
                        <h3>{round.name}</h3>

                        {round.bossLevel && (
                          <span className="boss-badge">
                            <Crown size={13} />
                            BOSS LEVEL
                          </span>
                        )}

                        {round.powerEnabled && (
                          <span className="power-badge">
                            <Zap size={13} />
                            POWER
                          </span>
                        )}
                      </div>

                      <p>
                        {round.type} • {round.difficulty} • {round.points}{" "}
                        points
                      </p>
                    </div>

                    <div className="round-actions">
                      <button
                        className={`status-btn ${
                          round.active ? "active" : "inactive"
                        }`}
                        onClick={() => toggleActive(round.id)}
                      >
                        {round.active ? "ACTIVE" : "INACTIVE"}
                      </button>

                      <button
                        className="edit-round-btn"
                        onClick={() => openEditForm(round)}
                      >
                        <Edit3 size={16} />
                        EDIT
                      </button>

                      <button
                        className="delete-round-btn"
                        onClick={() => deleteRound(round.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="round-admin-details">
                    <div className="round-detail">
                      <Clock size={17} />
                      <div>
                        <small>TIMER</small>
                        <strong>{round.timer}s</strong>
                      </div>
                    </div>

                    <div className="round-detail">
                      <Target size={17} />
                      <div>
                        <small>POINTS</small>
                        <strong>{round.points}</strong>
                      </div>
                    </div>

                    <div className="round-detail">
                      <MapPin size={17} />
                      <div>
                        <small>LOCATION</small>
                        <strong>{round.location}</strong>
                      </div>
                    </div>

                    <div className="round-detail">
                      <KeyRound size={17} />
                      <div>
                        <small>HALF CODE</small>
                        <strong>{round.halfCode}</strong>
                      </div>
                    </div>

                    {round.powerEnabled && (
                      <div className="round-detail power-detail">
                        {getPowerIcon()}

                        <div>
                          <small>POWER</small>
                          <strong>{round.power}</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* QUESTION */}

                  <div className="round-question-preview">
                    <span>QUESTION</span>

                    <p>{round.question}</p>
                  </div>

                  {/* CLUE */}

                  <div className="round-clue-preview">
                    <span>CLUE</span>

                    <p>{round.clue}</p>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div className="round-modal-overlay">
          <div className="round-modal">
            <div className="round-modal-header">
              <div>
                <p className="admin-label">
                  {editingRound ? "EDIT ROUND" : "NEW ROUND"}
                </p>

                <h2>
                  {editingRound
                    ? `Configure Round ${form.roundNumber}`
                    : "Create New Round"}
                </h2>
              </div>

              <button className="modal-close-btn" onClick={closeForm}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {/* BASIC */}

              <div className="form-section">
                <div className="form-section-title">
                  <Target size={18} />
                  <h3>Basic Configuration</h3>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Round Number *</label>

                    <input
                      type="number"
                      name="roundNumber"
                      min="1"
                      max="10"
                      value={form.roundNumber}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Round Name *</label>

                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. The Hidden Code"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Round Type</label>

                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="Normal">Normal</option>
                      <option value="Challenge">Challenge</option>
                      <option value="Puzzle">Puzzle</option>
                      <option value="Boss">Boss</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Difficulty</label>

                    <select
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                      <option value="Extreme">Extreme</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Points</label>

                    <input
                      type="number"
                      name="points"
                      min="0"
                      value={form.points}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Round Timer (seconds)</label>

                    <input
                      type="number"
                      name="timer"
                      min="30"
                      value={form.timer}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* QUESTION */}

              <div className="form-section">
                <div className="form-section-title">
                  <Target size={18} />
                  <h3>Question Configuration</h3>
                </div>

                <div className="form-group full-width">
                  <label>Question *</label>

                  <textarea
                    name="question"
                    rows="3"
                    placeholder="Enter the challenge question..."
                    value={form.question}
                    onChange={handleChange}
                  />
                </div>

                <div className="options-grid">
                  {form.options.map((option, index) => (
                    <div className="form-group" key={index}>
                      <label>Option {String.fromCharCode(65 + index)} *</label>

                      <input
                        type="text"
                        value={option}
                        placeholder={`Option ${String.fromCharCode(
                          65 + index
                        )}`}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Correct Answer *</label>

                  <select
                    name="correctAnswer"
                    value={form.correctAnswer}
                    onChange={handleChange}
                  >
                    <option value="">Select correct answer</option>

                    {form.options.map(
                      (option, index) =>
                        option && (
                          <option value={option} key={index}>
                            {String.fromCharCode(65 + index)} — {option}
                          </option>
                        )
                    )}
                  </select>
                </div>
              </div>

              {/* CLUE */}

              <div className="form-section">
                <div className="form-section-title">
                  <KeyRound size={18} />
                  <h3>Unlock Configuration</h3>
                </div>

                <div className="form-group full-width">
                  <label>Clue *</label>

                  <textarea
                    name="clue"
                    rows="3"
                    placeholder="Enter clue revealed after correct answer..."
                    value={form.clue}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <MapPin size={14} />
                      Location *
                    </label>

                    <input
                      type="text"
                      name="location"
                      placeholder="e.g. Computer Lab"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <KeyRound size={14} />
                      Half Code *
                    </label>

                    <input
                      type="text"
                      name="halfCode"
                      placeholder="e.g. CH-ROUND-01"
                      value={form.halfCode}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* BOSS */}

              <div className="form-section boss-section">
                <div className="form-section-title">
                  <Crown size={18} />
                  <h3>Boss Level Configuration</h3>
                </div>

                <label className="toggle-row">
                  <div>
                    <strong>Enable Boss Level</strong>
                    <small>
                      Make this round a special high-difficulty challenge.
                    </small>
                  </div>

                  <input
                    type="checkbox"
                    name="bossLevel"
                    checked={form.bossLevel}
                    onChange={handleChange}
                  />
                </label>

                {form.bossLevel && (
                  <div className="form-grid boss-fields">
                    <div className="form-group">
                      <label>Required Lives</label>

                      <input
                        type="number"
                        name="requiredLives"
                        min="1"
                        max="3"
                        value={form.requiredLives}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Bonus Points</label>

                      <input
                        type="number"
                        name="bonusPoints"
                        min="0"
                        value={form.bonusPoints}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* POWERS */}

              <div className="form-section power-section">
                <div className="form-section-title">
                  <Zap size={18} />
                  <h3>Power Configuration</h3>
                </div>

                <label className="toggle-row">
                  <div>
                    <strong>Enable Special Power</strong>
                    <small>
                      Give players a special ability during this round.
                    </small>
                  </div>

                  <input
                    type="checkbox"
                    name="powerEnabled"
                    checked={form.powerEnabled}
                    onChange={handleChange}
                  />
                </label>

                {form.powerEnabled && (
                  <div className="form-grid power-fields">
                    <div className="form-group">
                      <label>Power Type</label>

                      <select
                        name="power"
                        value={form.power}
                        onChange={handleChange}
                      >
                        <option value="Shield">🛡️ Shield</option>
                        <option value="Extra Life">❤️ Extra Life</option>
                        <option value="Double Points">
                          ⭐ Double Points
                        </option>
                        <option value="Time Freeze">⏸️ Time Freeze</option>
                        <option value="Extra Clue">💡 Extra Clue</option>
                        <option value="Remove Option">
                          ❌ Remove Option
                        </option>
                        <option value="Double Attack">
                          ⚡ Double Attack
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Power Duration (seconds)</label>

                      <input
                        type="number"
                        name="powerDuration"
                        min="0"
                        value={form.powerDuration}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group full-width">
                      <label>Power Effect</label>

                      <textarea
                        name="powerEffect"
                        rows="2"
                        placeholder="Explain what this power does..."
                        value={form.powerEffect}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* STATUS */}

              <div className="form-section">
                <label className="toggle-row">
                  <div>
                    <strong>Round Active</strong>
                    <small>
                      Only active rounds can be played by teams.
                    </small>
                  </div>

                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />
                </label>
              </div>

              {/* ACTIONS */}

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeForm}
                >
                  <X size={17} />
                  CANCEL
                </button>

                <button type="submit" className="save-round-btn">
                  <Save size={17} />
                  {editingRound ? "UPDATE ROUND" : "SAVE ROUND"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoundManagement;