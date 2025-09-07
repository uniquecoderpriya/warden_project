"use client";

import { useState, useEffect } from "react";
import { Pagination as AntPagination } from "antd";
import { Pagination as PaginationType } from "../store/slices/propertiesSlice";

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  onPageChange,
}: PaginationProps) {
  const { currentPage, totalCount, limit } = pagination;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-center">
        <AntPagination
          current={currentPage}
          total={totalCount}
          pageSize={limit}
          onChange={onPageChange}
          showSizeChanger={false}
          showQuickJumper={!isMobile}
          showTotal={(total, range) =>
            isMobile
              ? `${range[0]}-${range[1]}`
              : `${range[0]}-${range[1]} of ${total} properties`
          }
          className="custom-pagination"
          size={isMobile ? "small" : "default"}
          simple={isMobile}
        />
      </div>
    </div>
  );
}
