import React, { useState, useEffect } from 'react';
import { Cloud, Upload, Download, Trash2, RefreshCw, Check, AlertCircle, FileJson, Clock, Database, ShieldCheck } from 'lucide-react';
import { User } from 'firebase/auth';
import { listBackups, uploadBackup, downloadBackup, deleteBackup, DriveFile } from '../lib/googleDrive';
import { initAuth, googleSignIn } from '../lib/googleAuth';

interface CloudBackupTabProps {
  onRestore: (data: any) => void;
  getCurrentData: () => any;
  onSaveNotice: () => void;
}

export const CloudBackupTab: React.FC<CloudBackupTabProps> = ({
  onRestore,
  getCurrentData,
  onSaveNotice
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [backups, setBackups] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        fetchBackups(t);
      },
      () => {
        setUser(null);
        setToken(null);
        setBackups([]);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchBackups = async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const files = await listBackups(accessToken);
      setBackups(files);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch backups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        fetchBackups(result.accessToken);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleCreateBackup = async () => {
    if (!token) return;
    setIsUploading(true);
    setError(null);
    try {
      const data = getCurrentData();
      const filename = `droidos_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      await uploadBackup(token, filename, data);
      setSuccess('Backup uploaded successfully!');
      fetchBackups(token);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create backup');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRestore = async (fileId: string) => {
    if (!token) return;
    const confirmed = window.confirm('Restore this backup? Current unsaved data will be overwritten.');
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await downloadBackup(token, fileId);
      onRestore(data);
      setSuccess('Backup restored successfully!');
      onSaveNotice();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to restore backup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!token) return;
    const confirmed = window.confirm('Permanently delete this backup from Google Drive?');
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    try {
      await deleteBackup(token, fileId);
      setSuccess('Backup deleted.');
      fetchBackups(token);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete backup');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Cloud className="w-8 h-8" />
        </div>
        <div className="max-w-md">
          <h2 className="text-xl font-bold text-white mb-2">Google Drive Cloud Backups</h2>
          <p className="text-sm text-slate-400">
            Securely save and sync your DroidOS profiles, roles, triggers, and settings to your personal Google Drive. 
            Access your data from any device.
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold flex items-center gap-3 shadow-lg shadow-white/5 transition-all"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          <span>Sign in with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Google Drive Backup Explorer</h2>
            <p className="text-xs text-slate-400">
              Logged in as {user.email} • Using personal cloud storage
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={isUploading}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          <span>Create New Cloud Backup</span>
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Backup List */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Database className="w-4 h-4 text-blue-400" />
            <span>Stored Backups</span>
          </div>
          <button 
            onClick={() => fetchBackups(token!)}
            disabled={isLoading}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="divide-y divide-slate-800">
          {backups.length === 0 ? (
            <div className="p-12 text-center text-slate-500 italic text-sm">
              No backups found on your Google Drive. Click "Create New Cloud Backup" to get started.
            </div>
          ) : (
            backups.map((file) => (
              <div key={file.id} className="p-4 hover:bg-slate-800/50 flex items-center justify-between transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Stored in Google Drive
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-700" />
                      <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                        {file.id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(file.id)}
                    className="p-2 rounded-lg bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-500/20 transition-all flex items-center gap-2 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
        <ShieldCheck className="w-5 h-5 text-emerald-400" />
        <p>
          DroidOS only requests the <code className="text-emerald-300">drive.file</code> scope, meaning it can only access files it creates. 
          Your other personal documents and files remain completely private and inaccessible.
        </p>
      </div>
    </div>
  );
};
