'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  List, ListOrdered, Quote, Code, Link, 
  Image as ImageIcon, AtSign, Smile, 
  ChevronDown, Check, X, Paperclip,
  Type, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Highlighter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  showToolbar?: boolean;
  autoFocus?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  className,
  minHeight = '200px',
  maxHeight = '400px',
  showToolbar = true,
  autoFocus = false,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLinkPopupOpen, setIsLinkPopupOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);

  // Mock users for mentions
  const users = [
    { id: 1, name: 'Alex Johnson', avatar: 'AJ' },
    { id: 2, name: 'Sam Wilson', avatar: 'SW' },
    { id: 3, name: 'Taylor Smith', avatar: 'TS' },
    { id: 4, name: 'Jordan Lee', avatar: 'JL' },
    { id: 5, name: 'Casey Brown', avatar: 'CB' },
  ];

  // Formatting functions
  const applyFormat = (format: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let newText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'underline':
        newText = `<u>${selectedText}</u>`;
        newCursorPos = start + 3;
        break;
      case 'strikethrough':
        newText = `~~${selectedText}~~`;
        newCursorPos = start + 2;
        break;
      case 'code':
        newText = `\`${selectedText}\``;
        newCursorPos = start + 1;
        break;
      case 'h1':
        newText = `# ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'h2':
        newText = `## ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'h3':
        newText = `### ${selectedText}`;
        newCursorPos = start + 4;
        break;
      case 'bullet':
        newText = `- ${selectedText}`;
        newCursorPos = start + 2;
        break;
      case 'numbered':
        newText = `1. ${selectedText}`;
        newCursorPos = start + 3;
        break;
      case 'quote':
        newText = `> ${selectedText}`;
        newCursorPos = start + 2;
        break;
      default:
        newText = selectedText;
    }
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);
    
    // Restore cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
      }
    }, 0);
  };

  // Insert link
  const insertLink = () => {
    if (!linkUrl.trim()) return;
    
    const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const linkTextToUse = linkText || selectedText || 'link';
    const finalLink = `[${linkTextToUse}](${linkUrl})`;
    
    const newValue = value.substring(0, start) + finalLink + value.substring(end);
    onChange(newValue);
    
    setIsLinkPopupOpen(false);
    setLinkUrl('');
    setLinkText('');
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + finalLink.length;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Insert mention
  const insertMention = (user: { id: number; name: string }) => {
    const mention = `@${user.name}`;
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const newValue = value.substring(0, start) + mention + ' ' + value.substring(start);
    onChange(newValue);
    
    setShowMentions(false);
    setMentionSearch('');
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = start + mention.length + 1;
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Handle @ key for mentions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '@') {
      setShowMentions(true);
    }
    
    // Handle tab for formatting
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert two spaces for tab
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPos = start + 2;
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  // Filter users for mentions
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  // Auto-focus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b bg-muted/30 p-2 flex items-center gap-1 flex-wrap">
          {/* Text formatting */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Type className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => applyFormat('h1')}>
                  <Heading1 className="h-4 w-4 mr-2" />
                  Heading 1
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFormat('h2')}>
                  <Heading2 className="h-4 w-4 mr-2" />
                  Heading 2
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => applyFormat('h3')}>
                  <Heading3 className="h-4 w-4 mr-2" />
                  Heading 3
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('bold')}>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('italic')}>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('underline')}>
              <Underline className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('strikethrough')}>
              <Strikethrough className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('code')}>
              <Code className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('bullet')}>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('numbered')}>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => applyFormat('quote')}>
              <Quote className="h-4 w-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Links and mentions */}
          <div className="flex items-center gap-1">
            <Popover open={isLinkPopupOpen} onOpenChange={setIsLinkPopupOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Link className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm">URL</Label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Text (optional)</Label>
                    <Input
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Link text"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsLinkPopupOpen(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={insertLink} disabled={!linkUrl.trim()}>
                      Insert Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover open={showMentions} onOpenChange={setShowMentions}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AtSign className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <Input
                    value={mentionSearch}
                    onChange={(e) => setMentionSearch(e.target.value)}
                    placeholder="Search users..."
                    className="mb-2"
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => insertMention(user)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                            {user.avatar}
                          </div>
                          <span className="text-sm">{user.name}</span>
                        </div>
                      </Button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No users found
                      </p>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Alignment */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'min-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0',
            'font-mono text-sm'
          )}
          style={{ minHeight, maxHeight }}
        />
        
        {/* Formatting hints */}
        <div className="absolute bottom-2 right-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono">
              Markdown
            </Badge>
            <span className="hidden sm:inline">Press @ to mention</span>
          </div>
        </div>
      </div>

      {/* Preview toggle */}
      <div className="border-t bg-muted/30 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Supports: **bold**, *italic*, `code`, [links](url), @mentions</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          Preview
        </Button>
      </div>
    </div>
  );
}
