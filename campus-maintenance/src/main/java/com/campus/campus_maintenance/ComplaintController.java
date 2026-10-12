
package com.campus.campus_maintenance;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/complaints")

public class ComplaintController {

    private final ComplaintRepository repository;

    private static final Set<String> VALID_STATUSES =
            Set.of("Pending", "In Progress", "Resolved");

    public ComplaintController(ComplaintRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Complaint createComplaint(@RequestBody Complaint complaint) {
        complaint.setStatus("Pending");
        return repository.save(complaint);
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return repository.findAll();
    }

    @PutMapping("/{id}/status")
    public Complaint updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String status = body.get("status");

        if (status == null || !VALID_STATUSES.contains(status)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid complaint status");
        }

        Complaint complaint = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Complaint not found"));

        complaint.setStatus(status);
        return repository.save(complaint);
    }
}

