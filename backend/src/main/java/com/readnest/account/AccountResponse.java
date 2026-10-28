package com.readnest.account;

public record AccountResponse(Long id, String displayName, String email) {

    public static AccountResponse from(CustomerAccount account) {
        return new AccountResponse(account.getId(), account.getDisplayName(), account.getEmail());
    }
}
