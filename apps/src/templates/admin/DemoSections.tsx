import {
  Button as MuiButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';

interface DemoStudent {
  id: number;
  email: string | null;
  username: string | null;
  name: string | null;
}

interface DemoAssignment {
  id: number;
  demo_type: string;
  section_name: string;
  login_type: string;
  grades: string[];
  unit_name: string;
  unit_group_name: string;
  demo_students: DemoStudent[];
}

interface DemoSectionsProps {
  demo_assignments: DemoAssignment[];
}

interface FormState {
  demo_type: string;
  section_name: string;
  login_type: string;
  grades: string;
  unit_name: string;
  unit_group_name: string;
  demo_student_ids: string;
}

const INITIAL_FORM_STATE: FormState = {
  demo_type: '',
  section_name: '',
  login_type: '',
  grades: '',
  unit_name: '',
  unit_group_name: '',
  demo_student_ids: '',
};

const getCSRFToken = (): string => {
  const token = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
  return token || '';
};

const DemoSections: React.FC<DemoSectionsProps> = ({demo_assignments}) => {
  const [assignments, setAssignments] =
    useState<DemoAssignment[]>(demo_assignments);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<DemoStudent[]>([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm(prev => ({...prev, [field]: value}));
  };

  const handleSubmit = async () => {
    setError(null);

    const studentIds = form.demo_student_ids
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (studentIds.length === 0) {
      setError('At least one demo student ID is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/admin/demo_sections/lookup_users?ids=${studentIds.join(',')}`,
        {
          headers: {Accept: 'application/json'},
        }
      );
      if (!response.ok) {
        throw new Error('Failed to look up users.');
      }
      const users: DemoStudent[] = await response.json();
      setPendingUsers(users);
      setConfirmOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to look up users.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCreate = async () => {
    setConfirmOpen(false);
    setError(null);
    setLoading(true);

    const grades = form.grades
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const studentIds = form.demo_student_ids
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(Boolean);

    try {
      const response = await fetch('/admin/demo_sections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-Token': getCSRFToken(),
        },
        body: JSON.stringify({
          demo_type: form.demo_type,
          section_name: form.section_name,
          login_type: form.login_type,
          grades: grades,
          unit_name: form.unit_name,
          unit_group_name: form.unit_group_name,
          demo_student_ids: studentIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const created: DemoAssignment = await response.json();
      setAssignments(prev => [...prev, created]);
      setForm(INITIAL_FORM_STATE);
      setSuccess(`Demo section type '${created.demo_type}' created.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create demo section.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, demoType: string) => {
    if (!window.confirm(`Delete demo section type '${demoType}'?`)) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/admin/demo_sections/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': getCSRFToken(),
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setAssignments(prev => prev.filter(a => a.id !== id));
      setSuccess(`Demo section type '${demoType}' deleted.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete demo section.'
      );
    }
  };

  return (
    <div>
      <h1>Demo Section Types</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {assignments.length > 0 ? (
        <table className="table table-hover table-condensed">
          <thead>
            <tr>
              <th>Demo Type</th>
              <th>Section Name</th>
              <th>Login Type</th>
              <th>Grades</th>
              <th>Unit Name</th>
              <th>Unit Group Name</th>
              <th>Demo Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(da => (
              <tr key={da.id}>
                <td>{da.demo_type}</td>
                <td>{da.section_name}</td>
                <td>{da.login_type}</td>
                <td>{da.grades.join(', ')}</td>
                <td>{da.unit_name}</td>
                <td>{da.unit_group_name}</td>
                <td>
                  <StudentList students={da.demo_students} />
                </td>
                <td>
                  <MuiButton
                    color="error"
                    variant="outlined"
                    size="small"
                    onClick={() => handleDelete(da.id, da.demo_type)}
                  >
                    Delete
                  </MuiButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No demo section types configured yet.</p>
      )}

      <hr />
      <h3>Add a Demo Section Type</h3>

      <FormField
        label='Demo Type (unique key, e.g. "aif")'
        value={form.demo_type}
        placeholder="e.g. aif"
        onChange={v => handleChange('demo_type', v)}
      />
      <FormField
        label="Section Name"
        value={form.section_name}
        placeholder="e.g. Demo Classroom"
        onChange={v => handleChange('section_name', v)}
      />
      <FormField
        label="Login Type"
        value={form.login_type}
        placeholder="e.g. word"
        onChange={v => handleChange('login_type', v)}
      />
      <FormField
        label="Grades (comma-separated)"
        value={form.grades}
        placeholder="e.g. 6, 7, 8"
        onChange={v => handleChange('grades', v)}
      />
      <FormField
        label="Unit Name"
        value={form.unit_name}
        placeholder="e.g. aif2-2025"
        onChange={v => handleChange('unit_name', v)}
      />
      <FormField
        label="Unit Group Name"
        value={form.unit_group_name}
        placeholder="e.g. artificial-intelligence-foundations-2025"
        onChange={v => handleChange('unit_group_name', v)}
      />
      <FormField
        label="Demo Student IDs (comma-separated)"
        value={form.demo_student_ids}
        placeholder="e.g. 1044, 1045"
        onChange={v => handleChange('demo_student_ids', v)}
      />
      <br />
      <MuiButton
        variant="contained"
        color="primary"
        disabled={loading}
        onClick={handleSubmit}
      >
        {loading ? 'Loading...' : 'Add Demo Section Type'}
      </MuiButton>

      <ConfirmDialog
        open={confirmOpen}
        demoType={form.demo_type}
        users={pendingUsers}
        onConfirm={handleConfirmCreate}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
};

interface FormFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <div className="form-group">
    <label>{label}</label>
    <input
      type="text"
      className="form-control"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

interface StudentListProps {
  students: DemoStudent[];
}

const StudentList: React.FC<StudentListProps> = ({students}) => (
  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
    {students.map(s => (
      <li key={s.id} style={{marginBottom: 4}}>
        <a href={`/admin/user_progress?user_identifier=${s.id}`}>
          {s.name || s.username || `User ${s.id}`}
        </a>
        <span style={{color: '#888', marginLeft: 4}}>
          (ID: {s.id}
          {s.username ? `, @${s.username}` : ''})
        </span>
      </li>
    ))}
  </ul>
);

interface ConfirmDialogProps {
  open: boolean;
  demoType: string;
  users: DemoStudent[];
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  demoType,
  users,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
    <DialogTitle>Confirm Demo Student Assignment</DialogTitle>
    <DialogContent>
      <Typography gutterBottom>
        Are you sure that <strong>{demoType}</strong> type demo sections should
        assign these users:
      </Typography>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.email || '(no email)'} &mdash; ID: {u.id}
            {u.username ? `, username: ${u.username}` : ''}
          </li>
        ))}
      </ul>
      <Typography variant="body2" color="error" style={{marginTop: 12}}>
        Every teacher will be able to see these students and their projects and
        responses. The students will be unable to log in and only admins will be
        able to modify the students. This cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions>
      <MuiButton onClick={onCancel}>Cancel</MuiButton>
      <MuiButton onClick={onConfirm} variant="contained" color="primary">
        Confirm
      </MuiButton>
    </DialogActions>
  </Dialog>
);

export default DemoSections;
