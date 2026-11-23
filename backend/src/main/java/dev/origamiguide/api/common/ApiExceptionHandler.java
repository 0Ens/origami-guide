package dev.origamiguide.api.common;

import dev.origamiguide.api.catalog.ModelNotFoundException;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Turns exceptions into RFC 9457 "Problem Details" responses
 * ({@code Content-Type: application/problem+json}), a standard error format that
 * clients can handle the same way for every endpoint.
 *
 * <p>Extending {@link ResponseEntityExceptionHandler} gives the same format to Spring's
 * own errors, such as validation failures (400) or unsupported methods (405).
 */
@RestControllerAdvice
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ModelNotFoundException.class)
    ProblemDetail handleModelNotFound(ModelNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Model not found");
        problem.setType(URI.create("https://origami-guide.dev/problems/model-not-found"));
        problem.setProperty("slug", ex.getSlug());
        return problem;
    }
}
