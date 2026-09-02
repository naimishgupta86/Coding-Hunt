import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  RotateCcw,
  KeyRound,
  Users,
  X,
  Save,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

function TeamManagement() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);

  const [form, setForm] = useState({
    teamName: "",
    college: "",
    members: "",
    set: "A",
  });

  // =========================================
  // LOAD TEAMS FROM MONGODB
  // =========================================

  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/teams`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load teams"
        );
      }

      setTeams(data.teams || []);
    } catch (error) {
      console.error(error);

      alert(
        "Teams load nahi ho paayi. Backend running hai?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // =========================================
  // OPEN ADD MODAL
  // =========================================

  const openAddModal = () => {
    setEditingTeam(null);

    setForm({
      teamName: "",
      college: "",
      members: "",
      set: "A",
    });

    setShowModal(true);
  };

  // =========================================
  // OPEN EDIT MODAL
  // =========================================

  const openEditModal = (team) => {
    setEditingTeam(team);

    setForm({
      teamName: team.teamName || "",
      college: team.college || "",
      members: Array.isArray(team.members)
        ? team.members.join(", ")
        : "",
      set: team.set || "A",
    });

    setShowModal(true);
  };

  // =========================================
  // ADD / UPDATE TEAM
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.teamName.trim()) {
      alert("Team name is required.");
      return;
    }

    try {
      setSaving(true);

      const members = form.members
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean);

      // -----------------------------
      // EDIT TEAM
      // -----------------------------

      if (editingTeam) {
        const response = await fetch(
          `${API_URL}/teams/${editingTeam.teamId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              teamName:
                form.teamName.trim(),
              college:
                form.college.trim(),
              members,
              set: form.set,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update team"
          );
        }

        alert("Team updated successfully.");
      }

      // -----------------------------
      // CREATE TEAM
      // -----------------------------

      else {
        const response = await fetch(
          `${API_URL}/teams`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              teamName:
                form.teamName.trim(),
              college:
                form.college.trim(),
              members,
              set: form.set,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to create team"
          );
        }

        alert(
          `Team created!\n\nTeam ID: ${data.team.teamId}\nStart Code: ${data.team.startCode}`
        );
      }

      setShowModal(false);

      await fetchTeams();
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // DELETE TEAM
  // =========================================

  const deleteTeam = async (teamId) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this team?"
      );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${API_URL}/teams/${teamId}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete team"
        );
      }

      await fetchTeams();

      alert("Team deleted successfully.");
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // =========================================
  // RESET TEAM
  // =========================================

  const resetTeam = async (teamId) => {
    const confirmReset =
      window.confirm(
        "Reset this team?\n\nRound will become 1, score 0 and lives 3."
      );

    if (!confirmReset) return;

    try {
      const response = await fetch(
        `${API_URL}/teams/${teamId}/reset`,
        {
          method: "POST",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to reset team"
        );
      }

      await fetchTeams();

      alert("Team reset successfully.");
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // =========================================
  // TOGGLE STATUS
  // =========================================

  const toggleStatus = async (team) => {
    const newStatus =
      team.status === "Active"
        ? "Disabled"
        : "Active";

    try {
      const response = await fetch(
        `${API_URL}/teams/${team.teamId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      await fetchTeams();
    } catch (error) {
      console.error(error);

      alert(error.message);
    }
  };

  // =========================================
  // SEARCH
  // =========================================

  const filteredTeams = teams.filter(
    (team) => {
      const value =
        search.toLowerCase();

      return (
        team.teamId
          ?.toLowerCase()
          .includes(value) ||
        team.teamName
          ?.toLowerCase()
          .includes(value) ||
        team.college
          ?.toLowerCase()
          .includes(value)
      );
    }
  );

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="team-management">

      {/* NAVBAR */}

      <nav className="team-navbar">

        <div className="team-nav-left">

          <button
            className="back-btn"
            onClick={() =>
              navigate(
                "/admin/dashboard"
              )
            }
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h2>
              TEAM{" "}
              <span>MANAGEMENT</span>
            </h2>

            <p>
              CODING HUNT ADMIN
            </p>
          </div>

        </div>

        <button
          className="add-team-btn"
          onClick={openAddModal}
        >
          <Plus size={17} />
          ADD TEAM
        </button>

      </nav>


      {/* HEADER */}

      <section className="team-page-header">

        <div>

          <p className="admin-label">
            PARTICIPANTS
          </p>

          <h1>
            Team Management
          </h1>

          <p>
            Create and manage teams
            participating in the hunt.
          </p>

        </div>

        <div className="team-total">

          <Users size={22} />

          <div>
            <small>
              TOTAL TEAMS
            </small>

            <strong>
              {teams.length}
            </strong>
          </div>

        </div>

      </section>


      {/* TOOLBAR */}

      <section className="team-toolbar">

        <div className="search-box">

          <Search size={17} />

          <input
            type="text"
            placeholder="Search team, ID or college..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        <div className="team-summary">

          <span>
            ACTIVE{" "}
            <strong>
              {
                teams.filter(
                  (team) =>
                    team.status ===
                    "Active"
                ).length
              }
            </strong>
          </span>

          <span>
            DISABLED{" "}
            <strong>
              {
                teams.filter(
                  (team) =>
                    team.status ===
                    "Disabled"
                ).length
              }
            </strong>
          </span>

        </div>

      </section>


      {/* TABLE */}

      <section className="teams-table-card">

        <div className="teams-table-header">

          <div>
            <h2>
              All Teams
            </h2>

            <p>
              Manage registered
              participants
            </p>
          </div>

          <span>
            {filteredTeams.length} Teams
          </span>

        </div>


        {loading ? (

          <div className="empty-teams">

            <h3>
              Loading teams...
            </h3>

          </div>

        ) : filteredTeams.length === 0 ? (

          <div className="empty-teams">

            <Users size={40} />

            <h3>
              No teams found
            </h3>

            <p>
              Add your first team to
              start managing
              participants.
            </p>

            <button
              onClick={
                openAddModal
              }
            >
              <Plus size={16} />
              ADD FIRST TEAM
            </button>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>

                  <th>TEAM</th>
                  <th>TEAM ID</th>
                  <th>START CODE</th>
                  <th>SET</th>
                  <th>ROUND</th>
                  <th>SCORE</th>
                  <th>LIVES</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>

                </tr>

              </thead>

              <tbody>

                {filteredTeams.map(
                  (team) => (

                    <tr
                      key={
                        team.teamId
                      }
                    >

                      {/* TEAM */}

                      <td>

                        <div className="team-name-cell">

                          <div className="team-avatar">

                            {team.teamName
                              ?.charAt(
                                0
                              )
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {
                                team.teamName
                              }
                            </strong>

                            <small>
                              {
                                team.college ||
                                "College not added"
                              }
                            </small>

                          </div>

                        </div>

                      </td>


                      {/* ID */}

                      <td>

                        <span className="team-id-badge">

                          {
                            team.teamId
                          }

                        </span>

                      </td>


                      {/* START CODE */}

                      <td>

                        <div className="code-cell">

                          <KeyRound
                            size={14}
                          />

                          <strong>
                            {
                              team.startCode
                            }
                          </strong>

                        </div>

                      </td>


                      {/* SET */}

                      <td>

                        <span className="team-id-badge">

                          SET{" "}
                          {team.set}

                        </span>

                      </td>


                      {/* ROUND */}

                      <td>

                        <strong>
                          {
                            team.round
                          }
                          /10
                        </strong>

                      </td>


                      {/* SCORE */}

                      <td>

                        <strong>
                          {
                            team.score
                          }
                        </strong>

                      </td>


                      {/* LIVES */}

                      <td>

                        <span className="lives-display">

                          {"❤️".repeat(
                            Math.max(
                              0,
                              team.lives ||
                                0
                            )
                          )}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <button
                          className={`status-badge ${
                            team.status ===
                            "Active"
                              ? "status-active"
                              : "status-disabled"
                          }`}
                          onClick={() =>
                            toggleStatus(
                              team
                            )
                          }
                        >

                          <span></span>

                          {
                            team.status
                          }

                        </button>

                      </td>


                      {/* ACTIONS */}

                      <td>

                        <div className="action-buttons">

                          <button
                            title="Edit team"
                            onClick={() =>
                              openEditModal(
                                team
                              )
                            }
                          >
                            <Edit
                              size={15}
                            />
                          </button>

                          <button
                            title="Reset team"
                            onClick={() =>
                              resetTeam(
                                team.teamId
                              )
                            }
                          >
                            <RotateCcw
                              size={15}
                            />
                          </button>

                          <button
                            className="delete-action"
                            title="Delete team"
                            onClick={() =>
                              deleteTeam(
                                team.teamId
                              )
                            }
                          >
                            <Trash2
                              size={15}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="team-modal">

            <div className="modal-header">

              <div>

                <p className="admin-label">
                  TEAM CONFIGURATION
                </p>

                <h2>
                  {editingTeam
                    ? "Edit Team"
                    : "Add New Team"}
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


            <form
              onSubmit={
                handleSubmit
              }
            >

              {/* NAME */}

              <label>
                Team Name
              </label>

              <input
                className="form-input"
                placeholder="e.g. Code Warriors"
                value={
                  form.teamName
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    teamName:
                      e.target.value,
                  })
                }
              />


              {/* COLLEGE */}

              <label>
                College
              </label>

              <input
                className="form-input"
                placeholder="e.g. Ambalika Institute"
                value={
                  form.college
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    college:
                      e.target.value,
                  })
                }
              />


              {/* MEMBERS */}

              <label>
                Team Members
              </label>

              <input
                className="form-input"
                placeholder="e.g. Naimish, Rahul, Aman"
                value={
                  form.members
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    members:
                      e.target.value,
                  })
                }
              />


              {/* SET */}

              <label>
                Question Set
              </label>

              <select
                className="form-input"
                value={form.set}
                onChange={(e) =>
                  setForm({
                    ...form,
                    set:
                      e.target.value,
                  })
                }
              >

                <option value="A">
                  Set A
                </option>

                <option value="B">
                  Set B
                </option>

                <option value="C">
                  Set C
                </option>

              </select>


              {/* INFO */}

              {!editingTeam && (

                <div className="generated-info">

                  <KeyRound
                    size={17}
                  />

                  <div>

                    <strong>
                      Team ID &
                      Start Code
                    </strong>

                    <p>
                      Automatically
                      generated by
                      the server.
                    </p>

                  </div>

                </div>

              )}


              {/* SAVE */}

              <button
                className="save-team-btn"
                disabled={saving}
              >

                {saving ? (
                  "SAVING..."
                ) : editingTeam ? (
                  <>
                    <Save
                      size={16}
                    />
                    SAVE CHANGES
                  </>
                ) : (
                  <>
                    <CheckCircle
                      size={16}
                    />
                    CREATE TEAM
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

export default TeamManagement;