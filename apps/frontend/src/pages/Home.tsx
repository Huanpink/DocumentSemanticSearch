import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrainCircuit, FileSearch, ShieldCheck, Zap, Database, Server, LayoutDashboard } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-4 pt-10 pb-8">
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          Phiên bản MVP 1.0
        </Badge>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-primary">
          Document Semantic Search
        </h1>
        <p className="text-xl text-muted-foreground max-w-[42rem] leading-normal sm:text-2xl sm:leading-8">
          Phần mềm tìm kiếm tài liệu PDF thông minh sử dụng AI (Semantic Search).
          Tra cứu quy chế, hợp đồng, tài liệu nội bộ bằng ngôn ngữ tự nhiên.
        </p>
      </section>

      {/* Giá trị mang lại (Value Proposition) */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Nhanh chóng</CardTitle>
            <CardDescription>Tìm kiếm xuyên suốt hàng ngàn trang tài liệu chỉ trong vài giây.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-2">
              <BrainCircuit className="h-6 w-6 text-blue-500" />
            </div>
            <CardTitle>Thông minh</CardTitle>
            <CardDescription>Hỗ trợ tìm bằng câu hỏi tự nhiên (Semantic search), không cần nhớ chính xác từ khóa.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-12 w-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2">
              <FileSearch className="h-6 w-6 text-orange-500" />
            </div>
            <CardTitle>Minh bạch</CardTitle>
            <CardDescription>Kết quả trả về trỏ thẳng đến tên file, số trang và highlight đoạn văn bản gốc.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/50">
          <CardHeader className="space-y-1 pb-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Bảo mật & Tự lưu trữ</CardTitle>
            <CardDescription>Triển khai hoàn toàn nội bộ (Self-hosted), không gọi API của bên thứ ba, đảm bảo an toàn dữ liệu tuyệt đối.</CardDescription>
            <CardTitle>Bảo vệ dữ liệu tuyệt đối</CardTitle>
            <CardDescription>Sử dụng mô hình trí tuệ nhân tạo độc lập. Tài liệu không bị gửi cho bất kỳ bên thứ ba nào (như ChatGPT), ngăn chặn hoàn toàn nguy cơ rò rỉ thông tin.</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* Thông tin kỹ thuật (Tech Stack) */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Công nghệ cốt lõi</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Giao diện (Frontend)</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">ReactJS & Tailwind</div>
              <p className="text-xs text-muted-foreground mt-1">Single Page Application mượt mà, tích hợp PDF Viewer.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Xử lý (Backend & AI)</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">FastAPI & LangChain</div>
              <p className="text-xs text-muted-foreground mt-1">Model Embedding tiếng Việt (vd: vietnamese-sbert).</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lưu trữ (Database)</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">PostgreSQL & pgvector</div>
              <p className="text-xs text-muted-foreground mt-1">Lưu trữ Vector nhúng, Text Chunk và metadata tài liệu.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
