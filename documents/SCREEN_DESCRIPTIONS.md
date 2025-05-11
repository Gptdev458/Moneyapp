# Screen Descriptions

This document details the appearance, functionality, and user flow for each screen in the Personal Money Manager application.

---

## Screen: Transactions (Main/Home Screen)

**Purpose:**
To provide users with an overview of their financial transactions for a selected period, display financial summaries, and allow easy navigation through their financial history. This is the default screen upon opening the app.

**Key Features & Functionality:**

*   **Date Navigation:**
    *   Displays the current month and year (e.g., "May 2025").
    *   Users can tap arrow icons to move to the previous or next month.
    *   Tapping the "Month Year" text opens a dedicated modal for selecting a specific month and year.
*   **View Switching Tabs:**
    *   A row of tabs allows switching between different views: "Daily", "Calendar", "Monthly", "Total", "Note". The selected tab is highlighted.
*   **Financial Summary Bar:**
    *   Located below the view tabs, this bar displays total "Income", "Expenses", and "Total" (Income - Expenses) for the period relevant to the selected view. Amounts are color-coded.
*   **"Daily" View Content:**
    *   Shows a list of transactions, grouped by date (e.g., "07 Wed 05.2025").
    *   Each date group includes a sub-summary of total income and expenses for that day.
    *   Individual transaction items display: a small category icon/initials, category name, transaction description, account used, and the transaction amount (color-coded).
    *   The transaction list occupies roughly half the screen and can be expanded or collapsed by the user.
*   **"Calendar" View Content:**
    *   Displays a full month calendar grid.
    *   Each day cell in the calendar shows summarized income and/or expense totals for that day.
    *   The currently selected day or today's date is visually highlighted.
*   **"Monthly", "Total", "Note" View Content:**
    *   **Monthly:** Lists all transactions for the selected month.
    *   **Total:** Shows a cumulative summary for a broader period (e.g., the selected year).
    *   **Note:** Displays a list of transactions that have notes attached for the selected period.
*   **Budget Display Area (Associated with "Daily" View):**
    *   The area of the screen not occupied by the transaction list (approximately half the screen) is designated for displaying budgets categorized by spending type.
*   **Add Transaction Button:**
    *   A prominent circular button with a "+" icon, typically located at the bottom right (Floating Action Button - FAB). Tapping it opens the "Add Transaction" screen.
*   **Secondary Action Button:**
    *   A smaller circular button with a list/calculator icon, positioned near the primary "+" button. (Function: e.g., "Add from Template" or "Quick Add". If unclear, this can be a simple link to "Add Transaction" for now).
*   **Header Controls (Top Right):**
    *   **Star Icon:** (Function: e.g., Bookmark current view/filters).
    *   **Search Icon:** (Function: Search transactions).
    *   **More Options Icon (three vertical dots):** (Function: e.g., Export view, View settings).

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Main Header:** Contains left/right month navigation arrows, the "Month Year" text, and icons (Star, Search, More Options) on the right.
*   **View Tabs Bar:** Horizontal row of tappable text labels for "Daily", "Calendar", etc.
*   **Summary Bar:** Three distinct sections for Income, Expenses, Total.
*   **Content Area:** Dynamically changes based on the selected view tab. For "Daily" view, it's split between the expandable transaction list and the budget display. For "Calendar" view, it's the month grid.
*   **Month/Year Picker Modal:** Appears when "Month Year" is tapped. Shows year navigation and a grid of selectable months. Has a "THIS MONTH" quick select button and a close button.
*   **Floating Action Buttons (FABs):** Primary red "+" button and a smaller secondary button.
*   **Bottom Navigation Bar:** Icons and text for "Trans." (highlighted as active), "Stats", "Accounts", "More".

**User Interaction & Flow:**

*   Default screen on app launch.
*   Tapping month arrows or the month/year text changes the displayed period.
*   Tapping view tabs changes the content displayed below the summary bar.
*   The transaction list in "Daily" view is scrollable and can be expanded/collapsed.
*   Tapping the "+" FAB navigates to the "Add Transaction" screen.
*   The bottom navigation bar allows switching to other main sections of the app.

---

## Screen: Stats

**Purpose:**
To provide users with visual representations of their income and expenses, allowing them to analyze spending patterns by category over various time periods.

**Key Features & Functionality:**

*   **Date/Period Navigation:**
    *   Displays the current period (e.g., "Apr 2025").
    *   Users can tap arrow icons to move to the previous or next period.
    *   A dropdown menu or segmented control (e.g., showing "Monthly") allows users to select the period type: "Weekly", "Monthly", "Yearly", or "Custom".
*   **Income/Expense Toggle:**
    *   Tabs or clearly demarcated sections to switch between viewing "Income" statistics and "Expenses" statistics. The total amount for the selected type and period is displayed. The active selection is visually highlighted.
*   **Main Statistics Display (Pie Chart & Category List):**
    *   **Pie Chart:** A circular chart visually representing the proportion of each category's financial activity (income or expenses) for the selected period. Each slice is distinctly colored and labeled with the category name and its percentage.
    *   **Category List:** Displayed below the pie chart. Each item in the list corresponds to a category and shows: a small color swatch (matching the pie chart slice), the category's percentage of the total, the category name, and the total monetary amount for that category in the selected period. This list is scrollable.
*   **Category Detail View:**
    *   Accessed by tapping on a category item from the list below the pie chart.
    *   **Header:** Displays the selected category's name (e.g., "paycheck") and retains the period navigation controls.
    *   **Total Amount Display:** Shows the total amount for the selected category within the chosen period.
    *   **Historical Trend Graph:** A line graph illustrating the monetary trend of the selected category over a historical range (e.g., the past 6-12 months leading up to the selected period). The X-axis represents time (months), and the Y-axis represents the amount.
    *   **Transaction List for Category:** Below the graph, a list displays all transactions belonging to this specific category that occurred within the selected period. Transactions are grouped by date. Each item shows transaction description, account, and amount.

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Main Stats View Header:** Contains left/right period navigation arrows, the current period display text, and a dropdown/button for selecting the period type (Weekly, Monthly, etc.) on the right.
*   **Income/Expense Toggle Bar:** Positioned below the header, showing "Income [Amount]" and "Expenses [Amount]". The active choice is highlighted.
*   **Main Stats Content Area:** Features the pie chart prominently, with the scrollable category list directly underneath.
*   **Category Detail View Header:** Contains a back arrow (to return to the main stats view), the category name in the center, and the period navigation controls on the right.
*   **Category Detail Content Area:** Displays the total amount for the category, the line graph, and then the scrollable list of transactions for that category.
*   **Bottom Navigation Bar:** "Stats" tab is highlighted as active.

**User Interaction & Flow:**

*   Accessed via the "Stats" tab in the bottom navigation bar.
*   Users can change the period and period type using the header controls.
*   Users can toggle between "Income" and "Expenses" views.
*   Tapping a category in the list navigates to the "Category Detail View" for that category.
*   The back arrow in the "Category Detail View" returns the user to the main "Stats" screen.

---

## Screen: Accounts List

**Purpose:**
To allow users to view a summary of all their financial accounts, their respective balances, and an overall financial position (assets, liabilities, net worth).

**Key Features & Functionality:**

*   **Overall Financial Summary:**
    *   Displays "Assets" (total of positive account balances), "Liabilities" (total of accounts with negative balances, like debts), and "Total" (Net Worth: Assets - Liabilities). Amounts are color-coded.
*   **Account Listing:**
    *   A list of all user-defined financial accounts.
    *   Accounts can be presented with section headers indicating their type (e.g., "Cash", "Bank", "Savings", "Investment", "Debt").
    *   Each account item in the list clearly displays the Account Name (e.g., "Wallet", "Tekuci racun") and its Current Balance. Balances may be color-coded (e.g., debts in red).
*   **Header Controls (Top Right):**
    *   **Graph/Stats Icon:** (Function: e.g., view net worth trend over time).
    *   **More Options Icon (three vertical dots):** (Function: e.g., "Add New Account", "Reorder Accounts", "Manage Account Types").

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Header:** Displays the title "Accounts" and, on the right, the Graph/Stats icon and More Options icon.
*   **Summary Bar:** Positioned below the header, showing three sections: "Assets [Amount]", "Liabilities [Amount]", "Total [Amount]".
*   **Account List Area:** A vertically scrollable list. Each row shows the account name on the left and its balance on the right. Section headers for account types might be visually distinct.
*   **Bottom Navigation Bar:** "Accounts" tab is highlighted as active.

**User Interaction & Flow:**

*   Accessed via the "Accounts" tab in the bottom navigation bar.
*   The list of accounts is scrollable.
*   Tapping on an individual account item in the list navigates the user to the "Account Detail" screen for that specific account.
*   Tapping header icons initiates their respective functions (e.g., opening a menu for "More Options").

---

## Screen: Account Detail

**Purpose:**
To provide users with a detailed statement and transaction history for a single, selected financial account over a chosen period.

**Key Features & Functionality:**

*   **Header Information:**
    *   Displays the name of the selected account (e.g., "Wallet").
    *   Includes period navigation controls: displays the current period (e.g., "May 2025") with arrow icons to move to the previous or next period.
*   **Statement Period Display:**
    *   Clearly shows the date range for the current view (e.g., "5.1.25 ~ 5.31.25").
*   **Account Summary for Period:**
    *   "Deposit": Total amount of money that came into this account during the selected period.
    *   "Withdrawal": Total amount of money that left this account during the selected period.
    *   "Total": Net change in the account's balance for the period (Deposit - Withdrawal).
    *   "Balance": The account's balance at the end of the selected period (or current running balance).
*   **Transaction Listing:**
    *   Displays a list of all transactions associated *only with this account* that occurred within the selected period.
    *   Transactions are grouped by date (e.g., "07 Wed 05.2025").
    *   Each date group shows total inflow and outflow *for this account* on that specific day.
    *   Individual transaction items display: a small category icon/initials, category name, transaction description, the amount (color-coded for inflow/outflow), and the running balance of the account after that transaction.
*   **Header Controls (Top Right):**
    *   **Graph/Stats Icon:** (Function: e.g., show a balance trend graph for this account).
    *   **Edit/Pencil Icon:** (Function: open a screen/modal to edit the details of this account, like its name or type).
*   **Add Transaction Button:**
    *   A prominent circular button with a "+" icon (FAB), typically at the bottom right. Tapping it opens the "Add Transaction" screen, pre-filling this account as the selected account.

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Header:** Contains a back arrow (to return to the "Accounts List" screen), the account name in the center, period navigation controls (< Month Year >) on the right, and far-right icons (Graph/Stats, Edit/Pencil).
*   **Statement Period Bar:** A text display of the date range, located below the header.
*   **Account Summary Bar:** Positioned below the statement period, showing four sections: "Deposit", "Withdrawal", "Total", "Balance" with their amounts.
*   **Transaction List Area:** A vertically scrollable list of transactions.
*   **FAB:** A red circular "+" button at the bottom right.
*   **Bottom Navigation Bar:** "Accounts" tab remains highlighted.

**User Interaction & Flow:**

*   Accessed by tapping an account from the "Accounts List" screen.
*   Users can change the displayed period using the header navigation controls.
*   The transaction list is scrollable.
*   Tapping the back arrow returns to the "Accounts List" screen.
*   Tapping the "+" FAB navigates to the "Add Transaction" screen.
*   Tapping the Edit icon opens an interface to modify account details.

---

## Screen: More (Settings/Utilities Hub)

**Purpose:**
To provide a centralized access point for various application settings, data management tools, support options, and other utilities.

**Key Features & Functionality (Focus on user-requested items for initial build):**

*   **Grid of Options:**
    *   A grid (e.g., 3 columns) displaying various selectable items, each with an icon and a text label.
    *   **Configuration:** Navigates to a dedicated screen for application settings (e.g., currency, date format, theme preferences, notification settings).
    *   **Accounts (Management):** Navigates to a screen for managing financial account settings (e.g., adding new accounts, editing existing ones, setting initial balances, archiving accounts). This might be the main "Accounts List" screen or a more settings-focused view.
    *   **Backup:** Navigates to a screen offering options to create data backups (e.g., local export) and restore data from backups.
    *   **(Other potential items from screenshot like "Passcode", "CalcBox", "PC Manager", "Feedback", "Help", "Recommend" can be added as placeholders or implemented later).**
*   **(Optional) Ad Display Area:** A section at the top of the screen for displaying an advertisement.
*   **(Optional) "Remove Ads" Link:** A text link, usually at the bottom, to initiate an in-app purchase to remove advertisements.
*   **App Version Display:** The current version of the application is shown, typically in the header or at the bottom of the screen.

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Header:** Displays the title "Settings" (or "More") and potentially the app version number on the right.
*   **(Optional) Ad Banner:** A rectangular area below the header.
*   **Grid Area:** The main content area, showing a grid of tappable items, each with an icon above its text label.
*   **(Optional) "Remove Ads" Link:** Text link below the grid.
*   **Bottom Navigation Bar:** "More" tab is highlighted as active.

**User Interaction & Flow:**

*   Accessed via the "More" tab in the bottom navigation bar.
*   Tapping on any item in the grid navigates to the corresponding screen or initiates the associated action (e.g., tapping "Configuration" opens the configuration settings screen).

---

## Screen: Add Transaction

**Purpose:**
To allow users to quickly and efficiently log new financial transactions, whether they are income, expenses, or transfers between accounts.

**Key Features & Functionality:**

*   **Transaction Type Selection:**
    *   Tabs at the top of the screen labeled "Income", "Expense", "Transfer". The currently selected type is visually highlighted.
*   **Header:**
    *   A back arrow on the left allows the user to cancel the transaction entry and return to the previous screen.
    *   The title in the center dynamically changes based on the selected transaction type (e.g., "Add Expense", "Add Income").
    *   A star icon on the right (Function: e.g., save as template or use a template - can be a placeholder initially).
*   **Input Form Fields:**
    *   **Date:** Displays the selected date and time (e.g., "5/7/25 (Wed) 22:23"). Defaults to the current date/time but is tappable to open a date and time picker for changes. An icon labeled "Rep/Inst." (Repeat/Installment) is present (Function: set up recurring transactions - can be a placeholder initially).
    *   **Account:** A field to select the primary account for the transaction. Tapping this field reveals the "Account Selection Panel" at the bottom. For "Transfer" type, two account fields are needed: "From Account" and "To Account".
    *   **Category:** A field to select the category for the transaction. Tapping this field reveals the "Category Selection Panel" at the bottom. (Not applicable or optional for "Transfer" type).
    *   **Amount:** An input field for the monetary value of the transaction. Expects numeric input. A calculator might be accessible from here.
    *   **Note:** An optional text input field for adding any additional details or a description for the transaction.
    *   **(Optional) Picture:** A way to attach a picture to the transaction (e.g., a photo of a receipt).
*   **Dynamic Selection Panel (Bottom Area):**
    *   This panel's content changes based on whether the "Account" or "Category" field in the form is active.
    *   **When "Account" field is active:**
        *   Panel Header: Titled "Accounts". Includes icons for managing accounts (e.g., reorder, edit) and a close (X) button for the panel.
        *   Panel Content: A grid of tappable buttons, each representing a user-defined account (e.g., "Wallet", "Tekuci racun").
    *   **When "Category" field is active:**
        *   Panel Header: Titled "Categories". Includes similar management icons and a close button.
        *   Panel Content: A grid/list of tappable buttons for available categories (filtered by transaction type: income categories for "Income" type, expense categories for "Expense" type).
*   **Input Workflow:**
    *   When the "Account" field is tapped/focused, the "Account Selection Panel" appears.
    *   After selecting an account from the panel, focus automatically moves to the "Category" field, and the panel updates to show categories.
    *   After selecting a category, focus automatically moves to the "Amount" field, and the on-screen keyboard (numeric) appears.
*   **Saving Transaction:**
    *   After entering the amount, pressing the "Done" or "Enter" key on the keyboard saves the transaction and closes the "Add Transaction" screen, returning the user to the previous screen.

**UI Elements & Layout:**

*   **Theme:** Dark.
*   **Screen Header:** Contains the back arrow, dynamic title, and star icon.
*   **Type Selector:** A horizontal row of three tappable buttons ("Income", "Expense", "Transfer").
*   **Form Area (Upper Part):** A series of rows, each with a label (Date, Account, Category, etc.) and its corresponding value display or input area. The currently "active" input field (e.g., "Account" when its panel is shown) might have a visual cue like an underline.
*   **Selection Panel (Lower Part):** Occupies the bottom half when active. Has its own header with a title (e.g., "Accounts") and control icons. The content is a grid of selectable items.
*   **Keyboard:** The standard system keyboard, appearing when text/numeric input fields are active.

**User Interaction & Flow:**

*   Accessed by tapping a "+" FAB from other screens (like "Transactions" or "Account Detail").
*   User selects transaction type ("Income", "Expense", or "Transfer").
*   User fills in the form fields, using the dynamic selection panels for "Account" and "Category".
*   The flow for Account -> Category -> Amount selection is designed to be sequential and efficient.
*   Tapping the back arrow in the header cancels the entry.
*   Completing the amount input and pressing "Done" on the keyboard saves the transaction.
*   The screen typically closes (dismisses) after a successful save or cancellation.