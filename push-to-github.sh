#!/bin/bash
cd "$(dirname "$0")"

COMMIT_MSG="${1:-Update Cash Plus application}"

echo "📦 تجهيز التغييرات..."
git add .

echo "💾 حفظ التحديثات ($COMMIT_MSG)..."
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "لا توجد تعديلات جديدة للالتزام بها."

echo "🚀 الرفع إلى GitHub..."
git push origin main

echo "✅ اكتمل الرفع إلى المستودع بنجاح!"
