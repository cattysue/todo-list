import TodoList from '@/components/todo-list'
import TodoForm from '@/components/todo-form'

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">할일 목록</h1>
      <TodoForm />
      <TodoList />
    </main>
  )
}
