'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { parseCSV } from '@/lib/utils/csv-parser';
import { FlashcardInput } from '@/types';

interface CSVImporterProps {
  onImport: (flashcards: FlashcardInput[]) => void;
  onClose: () => void;
}

export function CSVImporter({ onImport, onClose }: CSVImporterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<FlashcardInput[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.type.includes('csv')) {
      setErrors(['Please select a CSV file']);
      return;
    }
    
    setFile(selectedFile);
    
    try {
      const content = await selectedFile.text();
      const result = parseCSV(content);
      
      setPreview(result.flashcards);
      setErrors(result.errors);
    } catch (err) {
      setErrors(['Failed to read file']);
      console.error(err);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };
  
  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
    }
  };
  
  return (
    <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/50">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-indigo-100">
        <h3 className="font-medium text-slate-900">Import from CSV</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-indigo-100 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-slate-500" />
        </button>
      </CardHeader>
      
      <CardContent className="py-4 space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${isDragging 
              ? 'border-indigo-400 bg-indigo-100' 
              : 'border-slate-300 bg-white hover:border-indigo-300'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          
          <Upload className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-2 text-sm text-slate-600">
            Drag and drop a CSV file, or{' '}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-indigo-600 font-medium hover:underline"
            >
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Format: term,definition (one pair per line)
          </p>
        </div>
        
        {/* File Info & Preview */}
        {file && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-600 font-medium">
                {preview.length} cards found
              </span>
            </div>
            
            {errors.length > 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-xs text-amber-700 space-y-1">
                    {errors.slice(0, 3).map((err, i) => (
                      <p key={i}>{err}</p>
                    ))}
                    {errors.length > 3 && (
                      <p>...and {errors.length - 3} more warnings</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Preview Table */}
            {preview.length > 0 && (
              <div className="max-h-48 overflow-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">#</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Term</th>
                      <th className="px-3 py-2 text-left font-medium text-slate-600">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 5).map((fc, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2 text-slate-900 truncate max-w-[150px]">{fc.term}</td>
                        <td className="px-3 py-2 text-slate-600 truncate max-w-[150px]">{fc.definition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 5 && (
                  <div className="px-3 py-2 text-center text-xs text-slate-500 bg-slate-50 border-t">
                    ...and {preview.length - 5} more cards
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleImport}
            disabled={preview.length === 0}
          >
            Import {preview.length} Cards
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
