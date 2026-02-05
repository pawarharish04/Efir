---
description: Manage officers and platform users via the Admin Dashboard.
---

# Admin Dashboard Workflow

This workflow describes how to use the newly implemented Admin Dashboard to manage user access and view system statistics.

## Prerequisites
- You must be logged in as a user with the `admin` role.

## Accessing the Dashboard
1. Log in to the application.
2. In the Navigation Bar, click on **"Admin Panel"** (visible only to admins).
   - Alternatively, navigate directly to `/admin-dashboard`.

## Features

### 1. System Statistics
- **Total Citizens**: Count of registered citizen accounts.
- **Total Officers**: Count of all officer accounts.
- **Pending Approval**: (**Action Required**) Number of officers waiting for account verification.
- **Total FIRs**: Global count of FIRs filed.

### 2. Officer Management
The main table lists all officers registered in the system.

- **Approve Officer**:
  - Locate an officer with status **Pending** (Yellow Badge).
  - Click the **Green Checkmark Button** in the Actions column.
  - The status will update to **Approved** (Green Badge), granting them access to the Officer Dashboard.

- **Delete User**:
  - Click the **Red Trash Button** to permanently remove a user (officer or citizen) from the system.
  - **Warning**: This action is irreversible.

## Security Note
- Officers with `isApproved: false` are **blocked from logging in** until an admin approves them via this dashboard.
