package dev.origamiguide.api.catalog;

import com.fasterxml.jackson.annotation.JsonRawValue;

/**
 * @param fold the fold definition, written into the response as JSON as-is
 *             ({@link JsonRawValue}) instead of as an escaped string
 */
public record StepResponse(
        int number,
        String instruction,
        @JsonRawValue String fold) {
}
