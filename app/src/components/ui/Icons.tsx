/**
 * Custom Recruitment-Specific Icons
 * Premium Linear-style design for RecruLens platform
 */

import { 
  Briefcase, 
  User, 
  Users, 
  Search, 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle,
  Sparkles,
  TrendingUp,
  Filter,
  Star,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Edit2,
  Trash2,
  Plus,
  MoreHorizontal,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Shield,
  Award,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  BookOpen,
  GraduationCap,
  Building,
  Folder,
  Download,
  Upload,
  Share2,
  Copy,
  Link as LinkIcon,
  ExternalLink,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  Info,
  AlertTriangle,
  Check,
  X,
  Minus,
  Play,
  Pause,
  RotateCcw,
  Command
} from 'lucide-react';

// Standard reusable icons
export const IconBriefcase = Briefcase;
export const IconUser = User;
export const IconUsers = Users;
export const IconSearch = Search;
export const IconFileText = FileText;
export const IconCalendar = Calendar;
export const IconCheckCircle = CheckCircle;
export const IconClock = Clock;
export const IconXCircle = XCircle;
export const IconSparkles = Sparkles;
export const IconTrendingUp = TrendingUp;
export const IconFilter = Filter;
export const IconStar = Star;
export const IconChevronDown = ChevronDown;
export const IconChevronRight = ChevronRight;
export const IconGripVertical = GripVertical;
export const IconEdit2 = Edit2;
export const IconTrash2 = Trash2;
export const IconPlus = Plus;
export const IconMoreHorizontal = MoreHorizontal;
export const IconBarChart = BarChart3;
export const IconPieChart = PieChart;
export const IconTarget = Target;
export const IconZap = Zap;
export const IconShield = Shield;
export const IconAward = Award;
export const IconMessage = MessageSquare;
export const IconMail = Mail;
export const IconPhone = Phone;
export const IconMapPin = MapPin;
export const IconDollar = DollarSign;
export const IconBook = BookOpen;
export const IconGraduation = GraduationCap;
export const IconBuilding = Building;
export const IconFolder = Folder;
export const IconDownload = Download;
export const IconUpload = Upload;
export const IconShare = Share2;
export const IconCopy = Copy;
export const IconLink = LinkIcon;
export const IconExternalLink = ExternalLink;
export const IconSettings = Settings;
export const IconLogOut = LogOut;
export const IconBell = Bell;
export const IconHelp = HelpCircle;
export const IconInfo = Info;
export const IconAlert = AlertTriangle;
export const IconCheckMark = Check;
export const IconCross = X;
export const IconMinus = Minus;
export const IconPlay = Play;
export const IconPause = Pause;
export const IconRefresh = RotateCcw;
export const IconCommand = Command;

// Custom composite icons for specific use cases

/**
 * Premium job vacancy indicator with sparkle effect
 */
export function JobActiveBadge() {
  return (
    <div className="relative flex items-center gap-1.5">
      <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
      <Sparkles className="h-3 w-3 text-brand-600" />
    </div>
  );
}

/**
 * Application status indicators
 */
export function ApplicationStatus({ status }: { status: string }) {
  switch (status) {
    case 'submitted':
      return <Clock className="h-4 w-4 text-neutral-500" />;
    case 'parsed':
      return <FileText className="h-4 w-4 text-brand-600" />;
    case 'ai-assessment':
      return <Sparkles className="h-4 w-4 text-accent-600" />;
    case 'review':
      return <Users className="h-4 w-4 text-warning-600" />;
    case 'shortlisted':
      return <CheckCircle className="h-4 w-4 text-success-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-danger-600" />;
    case 'interview':
      return <Calendar className="h-4 w-4 text-blue-600" />;
    case 'selected':
      return <Award className="h-4 w-4 text-green-600" />;
    default:
      return <FileText className="h-4 w-4 text-neutral-400" />;
  }
}

/**
 * Skill level indicators
 */
export function SkillLevelBadge({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: Math.min(5, Math.max(1, level)) }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-accent-500 text-accent-500" />
      ))}
    </div>
  );
}

/**
 * Candidate matching score visualization
 */
export function MatchingScore({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-success-600';
    if (score >= 60) return 'text-warning-600';
    return 'text-danger-600';
  };
  
  const width = `${Math.round(score)}%`;
  
  return (
    <div className={`font-semibold ${getColor()}`}>
      {Math.round(score)}%
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-success-600' : score >= 60 ? 'bg-warning-600' : 'bg-danger-600'
          }`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

/**
 * Analytics metrics icons
 */
export function MetricIcon({ type }: { type: 'active-jobs' | 'applications' | 'shortlisted' | 'pending' | 'interviews' }) {
  switch (type) {
    case 'active-jobs':
      return <Briefcase className="h-5 w-5 text-brand-600" />;
    case 'applications':
      return <Users className="h-5 w-5 text-accent-600" />;
    case 'shortlisted':
      return <CheckCircle className="h-5 w-5 text-success-600" />;
    case 'pending':
      return <Clock className="h-5 w-5 text-warning-600" />;
    case 'interviews':
      return <Calendar className="h-5 w-5 text-blue-600" />;
  }
}

/**
 * AI enhancement indicator
 */
export function AIEnhancedIcon() {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent-100 to-accent-200 px-2 py-0.5 text-[10px] font-medium text-accent-800 dark:from-accent-900/40 dark:to-accent-800/40 dark:text-accent-300 border border-accent-200/50 dark:border-accent-700/50">
      <Sparkles className="h-3 w-3" />
      AI-Powered
    </div>
  );
}
