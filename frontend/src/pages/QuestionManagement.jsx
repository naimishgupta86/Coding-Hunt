import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  HelpCircle,
  CheckCircle,
  MapPin,
  Lightbulb,
  Code,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function QuestionManagement() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [selectedRound, setSelectedRound] = useState(1);
  const [selectedSet, setSelectedSet] = useState("A");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    question: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",

    answer: "A",
    marks: 100,
    time: 60,

    // CLUE
    clue: "",
    halfCode: "",

    // LOCATION
    locationName: "",
    locationHint: "",
    locationCode: "",

    // FINAL CODE
    fullCode: "",

    explanation: "",
  });

  // =====================================================
  // LOAD QUESTIONS
  // =====================================================

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/questions?set=${selectedSet}&round=${selectedRound}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load questions"
        );
      }

      setQuestions(data.questions || []);
    } catch (error) {
      console.error("FETCH QUESTIONS ERROR:", error);

      alert(
        "Questions load nahi ho paaye.\nBackend check karo."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSet, selectedRound]);

  // =====================================================
  // OPEN ADD MODAL
  // =====================================================

  const openAddModal = () => {
    setEditingQuestion(null);

    setForm({
      question: "",

      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",

      answer: "A",
      marks: 100,
      time: 60,

      clue: "",
      halfCode: "",

      locationName: "",
      locationHint: "",
      locationCode: "",

      fullCode: "",

      explanation: "",
    });

    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT MODAL
  // =====================================================

  const openEditModal = (question) => {
    setEditingQuestion(question);

    setForm({
      question: question.question || "",

      optionA: question.options?.A || "",
      optionB: question.options?.B || "",
      optionC: question.options?.C || "",
      optionD: question.options?.D || "",

      answer: question.answer || "A",

      marks: question.marks || 100,
      time: question.time || 60,

      clue: question.clue || "",
      halfCode: question.halfCode || "",

      locationName: question.locationName || "",
      locationHint: question.locationHint || "",
      locationCode: question.locationCode || "",

      fullCode: question.fullCode || "",

      explanation: question.explanation || "",
    });

    setShowModal(true);
  };

  // =====================================================
  // CREATE / UPDATE QUESTION
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.question.trim()) {
      alert("Question is required.");
      return;
    }

    if (
      !form.optionA.trim() ||
      !form.optionB.trim() ||
      !form.optionC.trim() ||
      !form.optionD.trim()
    ) {
      alert("Please enter all four options.");
      return;
    }

    try {
      setSaving(true);

      const questionData = {
        set: selectedSet,

        round: selectedRound,

        question: form.question.trim(),

        options: {
          A: form.optionA.trim(),
          B: form.optionB.trim(),
          C: form.optionC.trim(),
          D: form.optionD.trim(),
        },

        answer: form.answer,

        marks: Number(form.marks) || 100,

        time: Number(form.time) || 60,

        // ==============================
        // CLUE SYSTEM
        // ==============================

        clue: form.clue.trim(),

        halfCode: form.halfCode.trim(),

        // ==============================
        // LOCATION SYSTEM
        // ==============================

        locationName:
          form.locationName.trim(),

        locationHint:
          form.locationHint.trim(),

        locationCode:
          form.locationCode.trim(),

        // ==============================
        // FINAL CODE
        // ==============================

        fullCode:
          form.fullCode.trim(),

        explanation:
          form.explanation.trim(),
      };

      // =================================================
      // UPDATE
      // =================================================

      if (editingQuestion) {
        const response = await fetch(
          `${API_URL}/questions/${editingQuestion.questionId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(questionData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update question"
          );
        }

        alert("Question updated successfully.");
      }

      // =================================================
      // CREATE
      // =================================================

      else {
        const response = await fetch(
          `${API_URL}/questions`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(questionData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to create question"
          );
        }

        alert(
          `Question added successfully!\n\nSet: ${selectedSet}\nRound: ${selectedRound}`
        );
      }

      setShowModal(false);

      await fetchQuestions();
    } catch (error) {
      console.error("SAVE QUESTION ERROR:", error);

      alert(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE QUESTION
  // =====================================================

  const deleteQuestion = async (questionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete question"
        );
      }

      await fetchQuestions();

      alert("Question deleted successfully.");
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredQuestions = questions.filter(
    (q) =>
      q.question
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // =====================================================
  // TOTAL QUESTIONS
  // =====================================================

  const currentSetQuestions = questions.length;

  // =====================================================
  // INPUT UPDATE
  // =====================================================

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="question-management">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="question-navbar">

        <div className="question-nav-left">

          <button
            className="back-btn"
            onClick={() =>
              navigate("/admin/dashboard")
            }
          >
            <ArrowLeft size={17} />
          </button>

          <div>

            <h2>
              QUESTION{" "}
              <span>MANAGEMENT</span>
            </h2>

            <p>
              CODING HUNT ADMIN
            </p>

          </div>

        </div>

        <button
          className="add-question-btn"
          onClick={openAddModal}
        >
          <Plus size={17} />
          ADD QUESTION
        </button>

      </nav>

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="question-page-header">

        <div>

          <p className="admin-label">
            GAME CONTENT
          </p>

          <h1>
            Question Management
          </h1>

          <p>
            Manage questions, clues,
            locations and codes for
            all 10 rounds and 3 sets.
          </p>

        </div>

        <div className="question-total">

          <HelpCircle size={22} />

          <div>

            <small>
              CURRENT SET QUESTIONS
            </small>

            <strong>
              {currentSetQuestions}
            </strong>

          </div>

        </div>

      </section>

      {/* =================================================
          SET SELECTOR
      ================================================= */}

      <section className="round-selector-card">

        <div className="round-selector-title">

          <div>

            <p className="admin-label">
              QUESTION SET
            </p>

            <h2>
              Select Set
            </h2>

          </div>

        </div>

        <div className="admin-round-grid">

          {["A", "B", "C"].map((set) => (

            <button
              key={set}
              className={
                selectedSet === set
                  ? "admin-round active-admin-round"
                  : "admin-round"
              }
              onClick={() => {
                setSelectedSet(set);
                setSearch("");
              }}
            >

              <strong>
                SET {set}
              </strong>

              <small>
                Questions
              </small>

            </button>

          ))}

        </div>

      </section>

      {/* =================================================
          ROUND SELECTOR
      ================================================= */}

      <section className="round-selector-card">

        <div className="round-selector-title">

          <div>

            <p className="admin-label">
              ROUND CONFIGURATION
            </p>

            <h2>
              Set {selectedSet} —
              Select Round
            </h2>

          </div>

        </div>

        <div className="admin-round-grid">

          {Array.from(
            { length: 10 },
            (_, index) => index + 1
          ).map((round) => (

            <button
              key={round}
              className={
                selectedRound === round
                  ? "admin-round active-admin-round"
                  : "admin-round"
              }
              onClick={() => {
                setSelectedRound(round);
                setSearch("");
              }}
            >

              <strong>
                {String(round).padStart(2, "0")}
              </strong>

              <small>
                ROUND
              </small>

            </button>

          ))}

        </div>

      </section>

      {/* =================================================
          TOOLBAR
      ================================================= */}

      <section className="question-toolbar">

        <div>

          <h2>
            Set {selectedSet}
            {" — "}
            Round {selectedRound}
          </h2>

          <p>
            {filteredQuestions.length}{" "}
            questions configured
          </p>

        </div>

        <div className="question-search">

          <Search size={16} />

          <input
            placeholder="Search questions..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

      </section>

      {/* =================================================
          QUESTIONS LIST
      ================================================= */}

      <section className="questions-list">

        {loading ? (

          <div className="empty-questions">

            <HelpCircle size={42} />

            <h3>
              Loading questions...
            </h3>

          </div>

        ) : filteredQuestions.length === 0 ? (

          <div className="empty-questions">

            <HelpCircle size={42} />

            <h3>
              No questions in
              Set {selectedSet},
              Round {selectedRound}
            </h3>

            <p>
              Add a question to configure
              this round.
            </p>

            <button onClick={openAddModal}>
              <Plus size={16} />
              ADD QUESTION
            </button>

          </div>

        ) : (

          filteredQuestions.map((q, index) => (

            <div
              className="question-card"
              key={q.questionId}
            >

              {/* QUESTION HEADER */}

              <div className="question-card-top">

                <div className="question-number">
                  Q{index + 1}
                </div>

                <div className="question-content">

                  <h3>
                    {q.question}
                  </h3>

                  <div className="question-meta">

                    <span>
                      Set {q.set}
                    </span>

                    <span>
                      {q.marks} Points
                    </span>

                    <span>
                      {q.time} Seconds
                    </span>

                    <span className="correct-answer">
                      Correct: {q.answer}
                    </span>

                  </div>

                </div>

                <div className="question-actions">

                  <button
                    title="Edit"
                    onClick={() =>
                      openEditModal(q)
                    }
                  >
                    <Edit size={15} />
                  </button>

                  <button
                    className="delete-question"
                    title="Delete"
                    onClick={() =>
                      deleteQuestion(
                        q.questionId
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

              </div>

              {/* OPTIONS */}

              <div className="options-grid">

                {["A", "B", "C", "D"].map(
                  (option) => (

                    <div
                      key={option}
                      className={
                        option === q.answer
                          ? "answer-option correct-option"
                          : "answer-option"
                      }
                    >

                      <span>
                        {option}
                      </span>

                      <p>
                        {q.options?.[option]}
                      </p>

                      {option === q.answer && (
                        <CheckCircle size={15} />
                      )}

                    </div>

                  )
                )}

              </div>

              {/* =================================================
                  CLUE + LOCATION INFO
              ================================================= */}

              {(q.clue ||
                q.halfCode ||
                q.locationName ||
                q.locationHint ||
                q.locationCode ||
                q.fullCode) && (

                <div className="question-extra-info">

                  {/* CLUE */}

                  {q.clue && (

                    <div className="extra-info-item">

                      <Lightbulb size={17} />

                      <div>

                        <small>
                          CLUE
                        </small>

                        <p>
                          {q.clue}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* HALF CODE */}

                  {q.halfCode && (

                    <div className="extra-info-item">

                      <Code size={17} />

                      <div>

                        <small>
                          HALF CODE
                        </small>

                        <p>
                          {q.halfCode}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* LOCATION */}

                  {q.locationName && (

                    <div className="extra-info-item">

                      <MapPin size={17} />

                      <div>

                        <small>
                          LOCATION
                        </small>

                        <p>
                          {q.locationName}
                        </p>

                        {q.locationHint && (
                          <span>
                            {q.locationHint}
                          </span>
                        )}

                      </div>

                    </div>

                  )}

                  {/* LOCATION CODE */}

                  {q.locationCode && (

                    <div className="extra-info-item">

                      <Code size={17} />

                      <div>

                        <small>
                          LOCATION CODE
                        </small>

                        <p>
                          {q.locationCode}
                        </p>

                      </div>

                    </div>

                  )}

                  {/* FULL CODE */}

                  {q.fullCode && (

                    <div className="extra-info-item">

                      <Code size={17} />

                      <div>

                        <small>
                          FINAL CODE
                        </small>

                        <p>
                          {q.fullCode}
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              )}

            </div>

          ))

        )}

      </section>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showModal && (

        <div className="modal-overlay">

          <div className="question-modal">

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <p className="admin-label">
                  SET {selectedSet}
                  {" • "}
                  ROUND {selectedRound}
                </p>

                <h2>
                  {editingQuestion
                    ? "Edit Question"
                    : "Add Question"}
                </h2>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={19} />
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  QUESTION
              ================================================= */}

              <label>
                Question
              </label>

              <textarea
                className="question-input"
                placeholder="Enter your question..."
                value={form.question}
                onChange={(e) =>
                  updateForm(
                    "question",
                    e.target.value
                  )
                }
              />

              {/* =================================================
                  OPTIONS
              ================================================= */}

              <div className="options-form-grid">

                {["A", "B", "C", "D"].map(
                  (option) => (

                    <div key={option}>

                      <label>
                        Option {option}
                      </label>

                      <input
                        className="form-input"
                        placeholder={`Enter option ${option}`}
                        value={
                          form[
                            `option${option}`
                          ]
                        }
                        onChange={(e) =>
                          updateForm(
                            `option${option}`,
                            e.target.value
                          )
                        }
                      />

                    </div>

                  )
                )}

              </div>

              {/* =================================================
                  BASIC SETTINGS
              ================================================= */}

              <div className="question-settings">

                <div>

                  <label>
                    Correct Answer
                  </label>

                  <select
                    className="form-input"
                    value={form.answer}
                    onChange={(e) =>
                      updateForm(
                        "answer",
                        e.target.value
                      )
                    }
                  >

                    <option value="A">
                      Option A
                    </option>

                    <option value="B">
                      Option B
                    </option>

                    <option value="C">
                      Option C
                    </option>

                    <option value="D">
                      Option D
                    </option>

                  </select>

                </div>

                <div>

                  <label>
                    Marks
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={form.marks}
                    onChange={(e) =>
                      updateForm(
                        "marks",
                        e.target.value
                      )
                    }
                  />

                </div>

                <div>

                  <label>
                    Time (Seconds)
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="10"
                    value={form.time}
                    onChange={(e) =>
                      updateForm(
                        "time",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* =================================================
                  CLUE SYSTEM
              ================================================= */}

              <div className="form-section-title">

                <Lightbulb size={18} />

                <div>

                  <strong>
                    CLUE SYSTEM
                  </strong>

                  <small>
                    Give players a hint
                    when required
                  </small>

                </div>

              </div>

              <label>
                Clue
                <span> (Optional)</span>
              </label>

              <textarea
                className="question-input"
                placeholder="Example: Think about arrays..."
                value={form.clue}
                onChange={(e) =>
                  updateForm(
                    "clue",
                    e.target.value
                  )
                }
              />

              <label>
                Half Code
                <span> (Optional)</span>
              </label>

              <input
                className="form-input"
                placeholder="Example: CH-50"
                value={form.halfCode}
                onChange={(e) =>
                  updateForm(
                    "halfCode",
                    e.target.value
                  )
                }
              />

              {/* =================================================
                  LOCATION SYSTEM
              ================================================= */}

              <div className="form-section-title">

                <MapPin size={18} />

                <div>

                  <strong>
                    LOCATION SYSTEM
                  </strong>

                  <small>
                    Configure the next
                    physical location
                  </small>

                </div>

              </div>

              <label>
                Location Name
                <span> (Optional)</span>
              </label>

              <input
                className="form-input"
                placeholder="Example: Computer Lab"
                value={form.locationName}
                onChange={(e) =>
                  updateForm(
                    "locationName",
                    e.target.value
                  )
                }
              />

              <label>
                Location Hint
                <span> (Optional)</span>
              </label>

              <textarea
                className="question-input"
                placeholder="Example: Go to the lab where practical classes happen."
                value={form.locationHint}
                onChange={(e) =>
                  updateForm(
                    "locationHint",
                    e.target.value
                  )
                }
              />

              <label>
                Location Code
                <span> (Optional)</span>
              </label>

              <input
                className="form-input"
                placeholder="Example: LAB-204"
                value={form.locationCode}
                onChange={(e) =>
                  updateForm(
                    "locationCode",
                    e.target.value
                  )
                }
              />

              {/* =================================================
                  FINAL CODE
              ================================================= */}

              <div className="form-section-title">

                <Code size={18} />

                <div>

                  <strong>
                    FINAL CODE
                  </strong>

                  <small>
                    Code collected after
                    completing the clue
                  </small>

                </div>

              </div>

              <label>
                Full Code
                <span> (Optional)</span>
              </label>

              <input
                className="form-input"
                placeholder="Example: CODE-HUNT-2026"
                value={form.fullCode}
                onChange={(e) =>
                  updateForm(
                    "fullCode",
                    e.target.value
                  )
                }
              />

              {/* =================================================
                  EXPLANATION
              ================================================= */}

              <label>
                Explanation
                <span> (Optional)</span>
              </label>

              <textarea
                className="question-input"
                placeholder="Explain the correct answer..."
                value={form.explanation}
                onChange={(e) =>
                  updateForm(
                    "explanation",
                    e.target.value
                  )
                }
              />

              {/* =================================================
                  SAVE
              ================================================= */}

              <button
                className="save-question-btn"
                disabled={saving}
              >

                {saving ? (

                  "SAVING..."

                ) : editingQuestion ? (

                  <>
                    <Save size={16} />
                    SAVE CHANGES
                  </>

                ) : (

                  <>
                    <CheckCircle size={16} />
                    ADD QUESTION
                  </>

                )}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default QuestionManagement;