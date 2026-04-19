# MEDVET INTEGRATIVA - PRD

## Problema Original
Site de vendas de produtos de medicina veterinária integrativa com dicas de tratamento por especialistas veterinários.

## Stack Técnica
React + FastAPI + MongoDB + Tailwind CSS + Shadcn UI + Stripe + JWT

## Funcionalidades Implementadas
- Autenticação JWT (login, registro, admin)
- Catálogo de produtos (77+ produtos, 9 categorias incluindo Terapia Alimentar)
- Homepage com showcase de 25 terapias integrativas (click-to-expand com textos explicativos)
- **MEDVET TV** — Portal de vídeos (/videos) com 19 vídeos mapeados por terapia, filtros por tag, player modal
- **Vídeos dentro de cada terapia** na homepage (expandido)
- **Integração redes sociais** preparada: Instagram, TikTok, YouTube (aguardando IDs das contas)
- Menu lateral slide-in estilo MEDVi com 12 itens
- Página "Produtos por Tratamento" (/loja) por segmento
- Terapia Alimentar (/terapia-alimentar) — cetogênica, natural, funcional + 8 produtos
- Checkout Stripe + PIX simulado, Cupons, Fidelidade, Assinaturas
- Painel admin, Blog, Quiz 5 Elementos, Calculadora de Sintomas
- Equipe (Dra. Tabatha Novikov CRMV-SP 21194)
- Depoimentos com vídeo, Nossa Missão
- Tratamentos presenciais marcados como "Em breve"
- Acentuação PT-BR corrigida em 23+ arquivos

## Credenciais
- Admin: admin@medvet.com / admin123

## Integrações Sociais (preparadas, aguardando IDs)
- Instagram: env var INSTAGRAM_USERNAME + INSTAGRAM_URL
- TikTok: env var TIKTOK_USERNAME + TIKTOK_URL
- YouTube: env var YOUTUBE_CHANNEL_ID + YOUTUBE_URL

## Backlog
- P1: Deploy + domínio medvetintegrativa.com
- P1: Configurar IDs das redes sociais (Instagram, TikTok, YouTube)
- P1: Gerar vídeos com IA (Sora 2) quando saldo disponível
- P2: PIX real via Mercado Pago
- P2: Notificações push
- P2: Refatorar server.py em módulos

## Mocked/Placeholder
- PIX simulado, Email via logger
- Vídeos: 19 placeholders "Em breve" (sem arquivos de vídeo ainda)
- Redes sociais: estrutura pronta, sem contas configuradas
