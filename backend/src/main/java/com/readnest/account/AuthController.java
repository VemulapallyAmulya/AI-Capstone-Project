package com.readnest.account;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String ACCOUNT_SESSION_KEY = AuthController.class.getName() + ".accountId";

    private final CustomerAccountService accountService;

    public AuthController(CustomerAccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken csrfToken) {
        return Map.of("token", csrfToken.getToken());
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> currentAccount(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        Object accountId = session == null ? null : session.getAttribute(ACCOUNT_SESSION_KEY);
        CustomerAccount account = accountId instanceof Long id
            ? accountService.findById(id).orElse(null)
            : null;
        AuthResponse response = new AuthResponse(account == null ? null : AccountResponse.from(account));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
        @Valid @RequestBody RegisterRequest registration,
        HttpServletRequest request
    ) {
        CustomerAccount account = accountService.register(registration);
        startSession(request, account);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(new AuthResponse(AccountResponse.from(account)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest credentials,
        HttpServletRequest request
    ) {
        CustomerAccount account = accountService.authenticate(credentials);
        startSession(request, account);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .body(new AuthResponse(AccountResponse.from(account)));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    private void startSession(HttpServletRequest request, CustomerAccount account) {
        HttpSession session = request.getSession(true);
        request.changeSessionId();
        session.setAttribute(ACCOUNT_SESSION_KEY, account.getId());
    }
}
