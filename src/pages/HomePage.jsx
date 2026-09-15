import React from 'react';
import WalletStrip from '../components/specific/WalletStrip';
import TransactionForm from '../components/specific/TransactionForm';
import TransactionList from '../components/specific/TransactionList';

export default function HomePage(props) {
  return (
    <div className="animate-in fade-in duration-300">
      <WalletStrip
        wallets={props.wallets}
        walletBalances={props.walletBalances}
        hideBalance={props.hideBalance}
        formatCurrency={props.formatCurrency}
        onAdd={props.onAddWallet}
      />

      <div className="lg:grid lg:grid-cols-5 lg:gap-6 lg:items-start">
      <div className="lg:col-span-2 lg:sticky lg:top-6">
      <TransactionForm
        isScanning={props.isScanning} uploadStatus={props.uploadStatus} editId={props.editId} type={props.type} setType={props.setType}
        receiptInputRef={props.receiptInputRef} handleScanReceipt={props.handleScanReceipt} handleAddTransaction={props.handleAddTransaction}
        wallets={props.wallets} walletId={props.walletId} setWalletId={props.setWalletId} toWalletId={props.toWalletId} setToWalletId={props.setToWalletId}
        amount={props.amount} setAmount={props.setAmount} receivedAmount={props.receivedAmount} setReceivedAmount={props.setReceivedAmount} adminFee={props.adminFee} setAdminFee={props.setAdminFee}
        date={props.date} setDate={props.setDate} debtType={props.debtType} setDebtType={props.setDebtType} personName={props.personName} setPersonName={props.setPersonName} dueDate={props.dueDate} setDueDate={props.setDueDate}
        description={props.description} setDescription={props.setDescription} receiptImageUrl={props.receiptImageUrl} setReceiptImageUrl={props.setReceiptImageUrl} setPreviewImage={props.setPreviewImage}
        items={props.items} handleAddItem={props.handleAddItem} handleItemChange={props.handleItemChange} handleRemoveItem={props.handleRemoveItem} handleOpenItemCatModal={props.handleOpenItemCatModal}
        selectedCategories={props.selectedCategories} expenseCategories={props.expenseCategories} incomeCategories={props.incomeCategories} toggleCategory={props.toggleCategory} getLabelClass={props.getLabelClass} setShowCatModal={props.setShowCatModal}
        cancelEdit={props.cancelEdit} user={props.user} loading={props.loading} defaultCurrency={props.defaultCurrency}
      />
      </div>

      <div className="lg:col-span-3 lg:min-w-0">
      <TransactionList
        groupedHomeTransactions={props.groupedHomeTransactions}
        homeTransactionsCount={props.homeTransactionsCount}
        homeViewDate={props.homeViewDate}
        changeHomeMonth={props.changeHomeMonth}
        searchQuery={props.searchQuery}
        filterType={props.filterType}
        sortBy={props.sortBy}
        wallets={props.wallets}
        formatCurrency={props.formatCurrency}
        isFlatList={props.isFlatList}
        expandedId={props.expandedId}
        onToggleExpand={props.onToggleExpand}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onPreviewImage={props.setPreviewImage}
      />
      </div>
      </div>
    </div>
  );
}
