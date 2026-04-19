# MEDVET INTEGRATIVA - PRD

## Problema Original
Site de vendas de produtos de medicina veterinária integrativa com dicas de tratamento por especialistas veterinários.

## Stack Técnica
React + FastAPI + MongoDB + Tailwind CSS + Shadcn UI + Stripe + JWT

## Funcionalidades Implementadas
- Autenticação JWT (login, registro, admin)
- Catálogo de produtos (77+ produtos, 9 categorias)
- Homepage com 25 terapias integrativas (click-to-expand)
- **Chatbot "Converse com Especialistas"** — flutuante em todas as páginas, respostas baseadas em regras para 14 áreas terapêuticas, personalização por pet cadastrado
- **Meus Pets** (/meus-pets) — CRUD completo (nome, espécie, raça, idade, peso, condições/doenças)
- MEDVET TV — Portal de vídeos com 19 vídeos mapeados
- Integrações sociais preparadas (Instagram, TikTok, YouTube)
- Menu lateral slide-in, Produtos por Tratamento (/loja)
- Terapia Alimentar com 8 produtos
- Checkout Stripe + PIX simulado, Cupons, Fidelidade, Assinaturas
- Painel admin, Blog, Quiz 5 Elementos, Calculadora de Sintomas
- Equipe (Dra. Tabatha Novikov CRMV-SP 21194)
- Tratamentos presenciais marcados "Em breve"
- Acentuação PT-BR corrigida

## Credenciais
- Admin: admin@medvet.com / admin123

## Backlog
- P1: Deploy + domínio medvetintegrativa.com
- P1: Integrar IA real no chatbot (GPT via Universal Key)
- P1: Gerar vídeos com Sora 2
- P1: Configurar redes sociais (Instagram, TikTok, YouTube)
- P2: PIX real via Mercado Pago
- P2: Refatorar server.py em módulos

## Mocked/Placeholder
- Chat: respostas baseadas em regras (sem IA)
- Vídeos: placeholders "Em breve"
- PIX simulado, Email via logger
- Redes sociais: estrutura pronta, sem contas
