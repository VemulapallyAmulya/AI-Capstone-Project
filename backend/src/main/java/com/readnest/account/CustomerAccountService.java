package com.readnest.account;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Optional;

@Service
public class CustomerAccountService {

    private final CustomerAccountRepository repository;
    private final PasswordEncoder passwordEncoder;

    public CustomerAccountService(CustomerAccountRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public CustomerAccount register(RegisterRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be no more than 72 UTF-8 bytes.");
        }
        String email = normalizeEmail(request.email());
        if (repository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        CustomerAccount account = new CustomerAccount(
            email,
            request.displayName().trim(),
            passwordEncoder.encode(request.password())
        );
        try {
            return repository.saveAndFlush(account);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.", exception);
        }
    }

    @Transactional(readOnly = true)
    public CustomerAccount authenticate(LoginRequest request) {
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }
        String email = normalizeEmail(request.email());
        CustomerAccount account = repository.findByEmail(email).orElse(null);
        if (account == null || !passwordEncoder.matches(request.password(), account.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect.");
        }
        return account;
    }

    @Transactional(readOnly = true)
    public Optional<CustomerAccount> findById(Long id) {
        return repository.findById(id);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
