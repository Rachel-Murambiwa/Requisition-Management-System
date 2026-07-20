#  Requisition Management System (RMS)

A robust, fully automated internal procurement and workflow tracking platform designed for **uncommon.org**. This system streamlines corporate expenditures by allowing staff to request funds, passing requests through a multi-stage audit verification pipeline, and auto-compiling master manifestation sheets for executive disbursement clearance.

---

##  Tech Stack

*   **Framework:** Next.js (App Router, React)
*   **Database & Auth:** Supabase (PostgreSQL, GoTrue Auth Engine)
*   **Styling:** Tailwind CSS
*   **Iconography:** Lucide React

---

##  Core Architecture & File Directory

```text
├── app/
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   │   ├── new/             # Staff Provisioning Invite Engine
│   │   │   │   └── page.js          # Main System User Directory
│   │   │   └── page.js              # Root Admin Command Center
│   │   ├── finance-officer/
│   │   │   ├── manifest/            # Master Invoice Compilation Ledger
│   │   │   ├── review/
│   │   │   │   └── [id]/            # Detailed Document Verification View
│   │   │   └── page.js              # Central Finance Review Pool Dashboard
│   │   ├── head-of-operations/      # Operations Vetting Desk
│   │   │   └── page.js              # Operations Review Stream Dashboard
│   │   ├── country-manager/        # Final Disbursement Release Gate
│   │   │   └── page.js              # High-Level Management Approval Ledger
│   │   └── requester/               
│   │       ├── new/                 # Budget Requisition Creation Form
│   │       └── page.js              # Employee Requisition Submission Portal
│   ├── api/
│   │   └── invite-staff/            # Backend Administrative Staff Provisioning API
│   ├── login/                       # Secure Account Authentication Gateway
│   ├── reset-password/              # Secure Invitation Handshake Setup Page
│   ├── layout.js                    # Global Layout Template Configuration
│   └── page.js                      # Root Target Destination Router
├── components/
│   ├── layout/
│   │   └── NotificationCenter.js    # Real-time WebSocket Status Alerts
│   └── ui/                          # Shared Design Layout System Components
├── lib/
│   └── supabase/
│       ├── client.js                # Singleton Supabase Client Connection Instantiation
│       ├── server.js                # Server-Side Supabase Client Context Factory
│       └── middleware.js            # Secure Auth Context Validation Interceptor
```text

## Functional Flow & System Features
1. Automated Provisioning Pipeline
Invite Engine: Admins provision accounts directly through a custom dashboard interface by logging names, emails, custom role tags, and physical branch locations.

Database Triggers: Bypasses manual synchronization completely. The system uses an active PostgreSQL automated database trigger function linked directly to auth.users. The exact millisecond an administrator provisions an account, a clean data record is mirrored to public.profiles, handling role casting dynamically.

Invitation Credentials Handshake: Users verify via an automated token exchange page where they finalize their private credentials. The page explicitly flushes local and cookie-based recovery hashes from the browser document to allow a pristine next-phase login context.

2. Multi-Stage Audit Routing Matrix
Requisitions move programmatically across user clearance buckets based on financial tracking parameters:

Requester Desk: Employees submit formal funding logs detailing specifications, classification types, expected disbursement channels, and financial sums.

Finance Officer Pool: Acts as the primary clearing gate. Offers interactive grid controls to isolate pending registers, look up requests via fuzzy string matching, filter pipelines by region, or run immediate database-level mutations (Approvals/Rejections).

Automated Quote Enforcer: Dynamically detects if any standard request exceeds $50.00 and forces flags indicating vendor quotation verification requirements.

3. Master Manifestation Compiled Output
Dynamic Matrix Reduction: Groups all pre-vetted, isolated individual request strings down into clean categorization blocks and operational header segments dynamically.

Regional Financial Aggregators: Automatically accumulates live subtotals across operational regions (Harare, Bulawayo, Victoria Falls) to display real-time grand total evaluations.

Handshake Hand-off Dispatch: Compiles master data models and pushes WebSocket-connected alert logs straight onto the Country Manager gateway stream effortlessly.

## Security Configuration (Supabase SQL Integration)
Database Triggers (Profiles Mirroring Automation)
To completely automate account creation, run this script inside your Supabase SQL Editor. It catches new auth creations, maps metadata formats cleanly to match API payloads, and casts strings straight into custom enum structures:

SQL
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS trigger AS $$ DECLARE   raw_role_str text;   raw_hub_str text; BEGIN   raw_role_str := COALESCE(new.raw_user_meta_data->>'role', 'requester');   raw_hub_str  := COALESCE(new.raw_user_meta_data->>'hub_name', 'harare');    BEGIN     INSERT INTO public.profiles (id, name, email, role, hub_name)     VALUES (       new.id,       COALESCE(new.raw_user_meta_data->>'name', 'new staff member'),       new.email,       raw_role_str::platform_user_role,       raw_hub_str     );   EXCEPTION WHEN OTHERS THEN     RAISE WARNING 'Profile insertion failed for user \%: \%', new.id, SQLERRM;   END;    RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
  
Deployment & Cloud Infrastructure
The system is deployed and hosted as a live progressive web application using the following cloud pipeline:

1. Frontend & API Hosting (Vercel)
Live Production URL: https://requisition-management-system-melp.vercel.app

Build Engine: Next.js managed deployment pipeline tied to the main GitHub tracking branch.

Session Verification Handling: Edge routing configurations sync application cookie frameworks across both frontend components and serverless backend API paths.

2. Backend & Security Configuration (Supabase Cloud)
Database Layer: Hosted PostgreSQL instance executing automated triggers and custom relational enums.

Authentication Server: GoTrue service handling secure user administration via high-privilege service roles.
