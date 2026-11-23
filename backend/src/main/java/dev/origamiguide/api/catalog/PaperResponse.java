package dev.origamiguide.api.catalog;

import java.math.BigDecimal;

public record PaperResponse(
        BigDecimal sizeCm,
        PaperType type,
        String frontColor,
        String backColor,
        String note) {

    static PaperResponse of(PaperSpec paper, String note) {
        return new PaperResponse(paper.sizeCm(), paper.type(), paper.frontColor(), paper.backColor(), note);
    }
}
