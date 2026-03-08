
```
pharmacy_management_system
├─ app
│  ├─ app.js
│  ├─ auth.service.js
│  ├─ controllers
│  │  └─ app-shell.js
│  ├─ directives
│  │  ├─ sidebar.js
│  │  └─ topbar.js
│  ├─ routes.js
│  └─ views
│     ├─ app
│     │  ├─ customers.html
│     │  ├─ dashboard.html
│     │  ├─ invoice-details.html
│     │  ├─ invoices.html
│     │  ├─ product-details.html
│     │  ├─ products.html
│     │  ├─ shell.html
│     │  └─ suppliers.html
│     ├─ assets
│     │  ├─ Logo2.png
│     │  ├─ about.jpg
│     │  ├─ hero.jpg
│     │  ├─ landing_page.jpg
│     │  ├─ logo.png
│     │  └─ tealWall.jpg
│     ├─ public
│     │  ├─ landing.html
│     │  ├─ login.html
│     │  └─ signup.html
│     └─ styles
│        ├─ app-layout.css
│        ├─ home.css
│        ├─ nav.css
│        ├─ public-layout.css
│        ├─ signup.css
│        └─ theme.css
└─ index.html

```





---

# System Functionalities

## Authentication
- Secure login and signup using **Supabase Authentication**
- Session handling for authenticated users
- Retrieve logged-in user profile
- Display logged-in username in the topbar

---

## Dashboard
The dashboard provides an overview of pharmacy activity.

Features include:

- Total profit generated from invoices
- Total number of customers
- Total number of orders
- Sales analytics chart
- Top-selling medicines visualization
- Latest invoices table
- Ability to delete invoices directly from the dashboard

---

## Medicines / Products Management

The system allows full management of pharmacy medicines.

Features include:

- View medicines in a table
- Pagination for large datasets
- Search medicines by name or category
- Filter medicines
- Add new medicine
- Edit existing medicine
- Delete medicine
- Display medicine details including:
  - Name
  - Description
  - Price
  - Quantity
  - Category
  - Expiry date
  - Image
  - Supplier

---

## Customers Management

Customer management helps track pharmacy clients.

Features include:

- View all customers
- Pagination support
- Search customers by:
  - Name
  - Email
  - Phone number
  - Customer ID
- Add new customer
- Edit customer information
- Delete customer
- Display customer statistics such as:
  - Total customers
  - Loyal customers
  - New customers
- Track:
  - Orders placed
  - Total spending
  - Last order date

---

## Invoices Management

The invoice module handles the cashier operations.

Features include:

- View all invoices
- Search invoices by:
  - Invoice number
  - Customer
  - Created by
- Filter invoices by:
  - Status
  - Payment method
- Create new invoices
- Add **multiple medicines in the same invoice**
- Select quantities for each medicine
- Automatic calculation of:
  - Unit price
  - Line total
  - Invoice total
- View invoice details
- Delete invoices

---

## Suppliers Management

Suppliers are linked to medicines.

Features include:

- Manage supplier data
- Assign suppliers when creating medicines
- Track supplier relationships with medicines

---

## UI / UX Features

- Single Page Application using **AngularJS Routing**
- App shell layout with:
  - Sidebar navigation
  - Topbar
  - Dynamic content area
- Responsive cards and tables
- Pagination for better data navigation
- Search and filtering capabilities
- Modal dialogs for create/edit actions
- Clean dashboard UI design

---

## Database Features

The system uses **Supabase (PostgreSQL)** as the backend database.

Key characteristics include:

- CRUD operations through API services
- Relations between:

  - Users
  - Customers
  - Suppliers
  - Medicines
  - Invoices
  - Invoice items

- Automatic calculation of invoice totals and line totals using database logic

---

## Technologies Used

- AngularJS 1.8
- Bootstrap 5
- Supabase (PostgreSQL + Authentication)
- REST API
- HTML / CSS / JavaScript

---

## Future Improvements

Possible future enhancements include:

- Inventory stock alerts
- Supplier analytics
- Advanced reporting system
- Barcode scanning support
- Role-based access control