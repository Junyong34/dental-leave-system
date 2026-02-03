---
apply: manually
---

---

# React + TypeScript 리팩토링 및 코드리뷰 가이드

> 목적: React 18 + TypeScript 프로젝트의 가독성, 안정성, 성능, 유지보수성을 높이기 위한 리팩토링 원칙과 실천 전략을 정의합니다.
> 혼란스러운 코드베이스를 깔끔하고 유지보수 가능한 시스템으로 변환하며,의존성을 철저히 추적하여 기능 손상 없이 구조를 개선합니다.


---

당신의 주요 역할은 다음과 같습니다:

1. **현재 코드베이스 구조 분석**
    - 파일 구성, 모듈 경계, 아키텍처 패턴을 살핀다
    - 코드 중복, 강한 결합, SOLID 위반 여부를 식별한다
    - 컴포넌트 간 의존성과 상호작용 패턴을 매핑한다
    - 네이밍 컨벤션, 코드 일관성, 가독성 문제를 점검한다

2. **리팩터링 기회 식별**
    - 코드 스멜(긴 메서드, 거대 클래스, Feature Envy 등)을 감지한다
    - 재사용 가능한 컴포넌트/서비스로 추출할 수 있는 부분을 찾는다
    - 유지보수를 높일 수 있는 디자인 패턴 적용 지점을 찾는다
    - 리팩터링으로 완화할 수 있는 성능 병목을 식별한다
    - 현대화할 수 있는 구식 패턴을 찾는다

3. **단계별 상세 리팩터링 계획 수립**
    - 리팩터링을 논리적이고 점진적인 단계로 나눈다
    - 영향도, 위험도, 가치에 따라 우선순위를 매긴다
    - 핵심 변환에 대해 구체적인 코드 예시를 제공한다
    - 기능을 유지하는 중간 상태를 포함한다
    - 각 단계에 대한 명확한 수락 기준을 정의한다
    - 각 단계의 노력과 복잡도를 추정한다

4. **의존성과 위험 문서화**
    - 리팩터링의 영향을 받는 모든 컴포넌트를 매핑한다
    - 잠재적 Breaking Change와 그 영향을 식별한다
    - 추가 테스트가 필요한 영역을 강조한다
    - 각 단계에 대한 롤백 전략을 기록한다
    - 외부 의존성 또는 연동 지점을 명시한다
    - 제안된 변경의 성능 영향을 평가한다

## 1. 리팩토링 기본 원칙

### ✅ Do

- **단일 책임 원칙 (Single Responsibility Principle)**: 한 컴포넌트는 한 가지 역할만 수행하도록 설계합니다.
- **모듈화(Modularity)**: 관련된 기능은 동일한 모듈 안에서 응집시키고, 불필요한 의존성을 제거합니다.
- **선언적 컴포넌트 (Declarative Component)**: UI를 "어떻게"가 아닌 "무엇을" 렌더링할지를 중심으로 표현합니다.
- **가독성 우선**: 이름, 구조, 함수 길이, props 수를 줄여 읽기 쉬운 코드로 유지합니다.
- **타입 안정성**: `any` 사용 금지, `as const`, `satisfies`, `infer` 등을 활용한 추론 기반 타입 정의.
- **성능 최적화**: 불필요한 렌더링 제거, React.memo / useMemo / useCallback 적절 사용.
- **점진적 개선**: 기능 동치성을 유지한 채 단계적으로 리팩토링합니다.


### ❌ Don't

- 리팩토링 PR에 기능 추가를 혼합하지 않습니다.
- `// @ts-ignore` 로 문제를 숨기지 않습니다.
- 팀 컨벤션과 다른 코딩 스타일을 임의로 적용하지 않습니다.

---

## 2. 프로젝트 구조 (`src/main/front-app/src/`)

### 현재 디렉터리 구조

```
src/main/front-app/src/
├── api/                    # API 클라이언트 코드 (HTTP 통신, axios 기반)
├── components/             # 재사용 가능한 UI 컴포넌트 (Presentational)
├── containers/             # 비즈니스 로직이 포함된 컨테이너 컴포넌트
├── pages/                  # 라우트에 매핑되는 페이지 컴포넌트
│   └── cms/                # CMS 전용 페이지 (Mantine UI 사용)
├── rematch/                # Rematch 모델 및 상태 관리 (Redux 대체)
├── route/                  # 라우팅 설정 (routes.ts, routes.tsx)
├── types/                  # TypeScript 타입 정의 (DTO, 도메인 모델)
├── utils/                  # 공용 유틸리티 함수, Custom Hooks
├── constants/              # 상수 정의 (API 엔드포인트, 설정값 등)
├── static/                 # 정적 자산 (이미지, 폰트 등)
├── query/                  # React Query 관련 코드 (쿼리 키, 커스텀 훅)
├── common/                 # 공통 비즈니스 로직, 유틸리티
├── marketing/              # 마케팅 관련 기능 (광고, 트래킹 등)
├── App.tsx                 # 앱 엔트리 포인트
└── index.tsx               # React 렌더링 진입점
```


### 레이어 간 의존성 방향

```
utils / constants / types → api → rematch → components → containers → pages → App
```


- **UI 레이어(components, containers, pages)는 비즈니스 로직에 직접 접근하지 않음.**
- **CMS 관련 Mantine UI 라이브러리는 `pages/cms` 하위에서만 사용.**

---

## 3. 기술 스택 및 버전 정보

### 주요 라이브러리

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React | 18.0.2 | UI 라이브러리 |
| TypeScript | 5.6.3 | 정적 타입 검사 |
| react-redux | 7.2.0 | Redux 상태 관리 연동 |
| redux | 4.0.5 | 상태 관리 (Rematch 기반) |
| @tanstack/react-query | 4.29.5 | 서버 상태 관리 |
| axios | 1.4.0 | HTTP 클라이언트 |
| @mantine/core | 8.2.5 | UI 컴포넌트 라이브러리 (CMS 전용) |
| react-router | (버전 확인 필요) | 라우팅 |
| dayjs | 1.11.7 | 날짜/시간 처리 |
| vitest | 3.2.4 | 테스트 프레임워크 |
| @testing-library/react | 14.0.0 | React 컴포넌트 테스팅 |

### 빌드 도구
- **번들러**: Vite 5.4.11
- **패키지 매니저**: pnpm (권장)

---

## 4. 타입 설계 원칙 (Type-First)

### TypeScript 타입 정의 전략

- **자동 추론 우선:** 반환값을 명시하지 않고 TypeScript의 추론 기능을 활용합니다.
- **명시가 필요한 경우:** 외부 노출 API나 복잡한 제네릭의 경우 명시적 타입 작성.
- **DTO 기반 타입:** `api/httpClient/model/dto/` 하위의 DTO 타입을 최대한 활용.
- **유틸리티 타입 적극 사용:** `Pick`, `Omit`, `Partial`, `Readonly`, `Record`, `NonNullable` 등.
- **Type Guard 정의:** 런타임 타입 보호로 안전한 분기 처리.

```typescript
// DTO 기반 타입 활용 예시
import { ItemDisplayDto } from '@api/httpClient/model/dto/item-display-dto';

type ItemListProps = {
  items: ItemDisplayDto[];
  displayType: 'typeA' | 'typeC4';
};

// Type Guard 예시
function isItemDisplayDto(obj: unknown): obj is ItemDisplayDto {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'itemId' in obj &&
    'itemName' in obj
  );
}
```


---

## 5. React 리팩토링 패턴

### 🔹 선언적 컴포넌트 지향

- 명령형(`document.querySelector`, 직접 DOM 수정 등) 코드를 피하고, 상태 변화에 따른 UI 결과만 선언.
- 조건부 렌더링, 리스트 표현, 애니메이션 등을 선언적으로 처리.

### 🔹 단일 책임 컴포넌트

- UI, 상태, 비즈니스 로직을 명확히 분리.
- **컨테이너 컴포넌트(containers/)**: 데이터 fetch, 상태 관리, 이벤트 핸들링.
- **프레젠테이션 컴포넌트(components/)**: 렌더링 전용, props 기반 표현.

#### ✨ 리팩토링 예시: 복합 컴포넌트 분리

**🔻 Before: 모든 책임이 혼재된 컴포넌트**

```typescript
// ❌ 문제: UI + 데이터 로직 + 상태 관리가 모두 한 곳에
function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    setLoading(true);
    fetchProducts(selectedCategory)
      .then(data => setProducts(data))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className="product-page">
      <select 
        value={selectedCategory} 
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="all">전체</option>
        <option value="electronics">전자제품</option>
      </select>
      
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.price.toLocaleString()}원</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**🔺 After: 책임별로 분리된 구조**

```typescript
// ✅ Container: 데이터 로직 담당
function ProductListContainer() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: products, isLoading } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => fetchProducts(selectedCategory),
  });

  return (
    <ProductListView
      products={products || []}
      loading={isLoading}
      selectedCategory={selectedCategory}
      onCategoryChange={setSelectedCategory}
    />
  );
}

// ✅ Presentation: UI 렌더링만 담당
interface ProductListViewProps {
  products: Product[];
  loading: boolean;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

function ProductListView({ 
  products, loading, selectedCategory, onCategoryChange 
}: ProductListViewProps) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="product-page">
      <CategorySelect 
        value={selectedCategory}
        onChange={onCategoryChange}
      />
      <ProductGrid products={products} />
    </div>
  );
}

// ✅ 재사용 가능한 작은 컴포넌트들
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="product-grid">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**📝 개선 포인트:**
- **데이터 로직 분리**: React Query를 활용한 서버 상태 관리
- **UI 컴포넌트 분리**: 재사용 가능한 작은 단위로 분할
- **props 인터페이스**: 명확한 타입으로 컴포넌트 계약 정의
- **테스트 용이성**: 각 컴포넌트의 책임이 명확해져 단위 테스트 작성 편의

### 🔹 훅 기반 모듈화

- 중복된 상태/이펙트 로직을 커스텀 훅(`useXXX`)으로 추출.
- 훅은 명확한 책임을 가져야 하며, 사이드이펙트는 최소화.

#### ✨ 리팩토링 예시: 중복 로직을 커스텀 훅으로 추출

**🔻 Before: 여러 컴포넌트에서 중복되는 로직**

```typescript
// ❌ 문제: 동일한 상태 관리 로직이 여러 컴포넌트에 반복
function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await searchProducts(searchTerm);
      setResults(data);
    } catch (error) {
      console.error('검색 실패:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // JSX 렌더링...
}

function FilterPage() {
  const [filterTerm, setFilterTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);

  const handleFilter = async () => {
    if (!filterTerm.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await filterProducts(filterTerm);
      setFilteredItems(data);
    } catch (error) {
      console.error('필터링 실패:', error);
      setFilteredItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 거의 동일한 로직 반복...
}
```

**🔺 After: 커스텀 훅으로 로직 추출**

```typescript
// ✅ 재사용 가능한 커스텀 훅
function useAsyncSearch<T>(
  searchFn: (term: string) => Promise<T[]>
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);

  const executeSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await searchFn(searchTerm);
      setResults(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '검색 실패';
      setError(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, searchFn]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    error,
    executeSearch,
  };
}

// ✅ 간결해진 컴포넌트들
function SearchPage() {
  const {
    searchTerm,
    setSearchTerm,
    results,
    isLoading,
    executeSearch
  } = useAsyncSearch(searchProducts);

  return (
    <div>
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && executeSearch()}
      />
      {/* 결과 렌더링 */}
    </div>
  );
}

function FilterPage() {
  const {
    searchTerm: filterTerm,
    setSearchTerm: setFilterTerm,
    results: filteredItems,
    isLoading,
    executeSearch: executeFilter
  } = useAsyncSearch(filterProducts);

  // 동일한 훅으로 다른 컴포넌트도 간단하게 구현
}
```

**📝 개선 포인트:**
- **중복 제거**: 공통 로직을 하나의 훅으로 통합
- **재사용성**: 제네릭 타입으로 다양한 데이터 타입 지원
- **에러 처리**: 통합된 에러 상태 관리
- **타입 안정성**: TypeScript 제네릭으로 타입 추론 지원

**현재 프로젝트의 커스텀 훅 활용 예시:**

```typescript
// ✅ Good: 역할이 명확한 커스텀 훅
const { isMobile, isTablet, isDesktop } = useScreenDetector();
const queries = useQueryParams<'categoryId' | 'page'>();
const { displayedViewType, changeViewType } = useListViewType({ displayType: 'typeA' });
```


### 🔹 상태 관리 전략

#### Rematch (Redux 기반)
- **전역 상태**: `src/rematch/models/`에 도메인별 모델 정의.
- **useSelector + shallowEqual** 활용으로 불필요한 리렌더링 방지.

```typescript
const { currentStoreId } = useSelector(
  ({ auth }: RootState) => ({
    currentStoreId: auth.storeIds.hyper.storeId || ''
  }),
  shallowEqual
);
```


#### React Query (TanStack Query)
- **서버 상태 관리**: API 데이터 캐싱, 자동 갱신, 에러 핸들링.
- **staleTime, gcTime** 설정으로 캐시 전략 최적화.

```typescript
export const defaultQueryOptions = {
  queries: {
    staleTime: 5 * 60 * 1000,      // 5분
    gcTime: 30 * 60 * 1000,         // 30분 (구 cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  },
};
```


#### 최소 상태 원칙
- 파생값은 `useMemo`로 계산.
- 불필요한 상태 저장 금지 (props로 전달 가능한 경우 props 사용).
- 꼭 필요한 경우가 아니면 useMemo, useCallback 사용 지양한다.

```typescript
// ✅ Good: useMemo로 파생 상태 계산
const categoryName = useMemo(() => {
  const category = categoryList.find(({ cateCd }) => cateCd === Number(categoryId));
  return category?.cateNm || '전체';
}, [categoryList, categoryId]);
```


---

## 6. 컴포넌트 설계 원칙

### 🔹 선언적/컴포저블 설계
- **선언적 접근**: props로 "무엇을 하고 싶은지"를 표현하고, Imperative 핸들 최소화
- **컴포저블 구조**: 작은 단위의 컴포넌트들을 조합하여 복잡한 UI 구성

```typescript
// ✅ Good: 선언적 props 설계
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

// ❌ Bad: 명령형 핸들
interface ButtonRef {
  focus(): void;
  blur(): void;
  setLoading(loading: boolean): void;
}
```

### 🔹 Headless + Presentational 분리

로직 훅(useXxx) ↔ 스타일/레이아웃 컴포넌트 분리로 재사용성 향상

#### ✨ 리팩토링 예시: 모달 컴포넌트 로직 분리

**🔻 Before: 로직과 UI가 결합된 모달 컴포넌트**

```typescript
// ❌ 문제: 모달 로직 + UI 렌더링이 한 곳에 결합
interface ConfirmModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = () => setIsOpen(true);
  
  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    onCancel();
    closeModal();
  };

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Enter') handleConfirm();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className="modal-content">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={handleCancel}>취소</button>
          <button onClick={handleConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}
```

**🔺 After: 로직과 UI 분리**

```typescript
// ✅ Headless: 모달 동작 로직만 담당
interface UseModalOptions {
  onClose?: () => void;
  closeOnEscape?: boolean;
  closeOnEnter?: boolean;
  animationDuration?: number;
}

function useModal(options: UseModalOptions = {}) {
  const {
    onClose,
    closeOnEscape = true,
    closeOnEnter = false,
    animationDuration = 200
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  
  const closeModal = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      onClose?.();
    }, animationDuration);
  }, [onClose, animationDuration]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') closeModal();
      if (closeOnEnter && e.key === 'Enter') closeModal();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeModal, closeOnEscape, closeOnEnter]);

  return {
    isOpen,
    isClosing,
    openModal,
    closeModal,
  };
}

// ✅ Presentational: UI 렌더링만 담당
interface ModalProps {
  isOpen: boolean;
  isClosing: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

function Modal({ isOpen, isClosing, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''} ${className || ''}`}>
      <div className="modal-content">
        <div className="modal-cms-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// ✅ 조합하여 사용
function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
  const { isOpen, isClosing, openModal, closeModal } = useModal({
    closeOnEscape: true,
  });

  const handleConfirm = () => {
    onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    onCancel();
    closeModal();
  };

  return (
    <>
      <button onClick={openModal}>모달 열기</button>
      <Modal 
        isOpen={isOpen} 
        isClosing={isClosing} 
        onClose={closeModal} 
        title={title}
      >
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={handleCancel}>취소</button>
          <button onClick={handleConfirm}>확인</button>
        </div>
      </Modal>
    </>
  );
}
```

**📝 개선 포인트:**
- **로직 재사용**: `useModal` 훅을 다른 모달에서도 활용 가능
- **UI 유연성**: `Modal` 컴포넌트는 다양한 콘텐츠에 재사용 가능
- **테스트 분리**: 로직과 UI를 독립적으로 테스트 가능
- **옵션 확장**: 키보드 동작, 애니메이션 등을 설정으로 제어

### 🔹 Compound Components (필요 시)

Context를 활용한 느슨한 결합으로 복잡한 컴포넌트 구성

```typescript
// Context 기반 Compound Component
const SelectContext = createContext<{
  isOpen: boolean;
  selectedValue: string;
  onSelect: (value: string) => void;
} | null>(null);

const Select = ({ children, onValueChange }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  
  const handleSelect = useCallback((value: string) => {
    setSelectedValue(value);
    setIsOpen(false);
    onValueChange?.(value);
  }, [onValueChange]);
  
  return (
    <SelectContext.Provider value={{ isOpen, selectedValue, onSelect: handleSelect }}>
      <div className="select-container">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

Select.Trigger = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(SelectContext);
  return (
    <button onClick={() => context?.setIsOpen(!context.isOpen)}>
      {children}
    </button>
  );
};

Select.List = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(SelectContext);
  return context?.isOpen ? <div className="select-list">{children}</div> : null;
};
```

### 🔹 컨트롤드/언컨트롤드 전략

폼 요소는 기본 언컨트롤드 + 필요한 곳만 컨트롤드로 전환

```typescript
interface InputProps {
  // 언컨트롤드를 위한 props
  defaultValue?: string;
  // 컨트롤드를 위한 props
  value?: string;
  onChange?: (value: string) => void;
}

function Input({ value, defaultValue, onChange, ...props }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  
  // 컨트롤드 모드 감지
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (isControlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
      onChange?.(newValue);
    }
  };
  
  return <input value={inputValue} onChange={handleChange} {...props} />;
}
```

### 🔹 키/리스트/메모리 관리

안정적인 key 제공으로 React 렌더링 최적화

```typescript
// ✅ Good: 안정적인 key 사용
function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map((product) => (
        <ProductCard 
          key={product.id} // 고유하고 안정적인 ID 사용
          product={product} 
        />
      ))}
    </div>
  );
}

// ❌ Bad: 불안정한 key 사용
function ProductList({ products }: { products: Product[] }) {
  return (
    <div>
      {products.map((product, index) => (
        <ProductCard 
          key={index} // 배열 인덱스는 불안정
          product={product} 
        />
      ))}
    </div>
  );
}
```

---

## 7. 고급 상태 관리 전략

### 🔹 Context 쪼개기

하나의 거대한 Context → 읽기 패턴별 다중 Context 또는 셀렉터 훅 활용 
단, 특정 컴포넌트 상황이 아니면 rematch를 사용해서 상태 관리한다.

#### ✨ 리팩토링 예시: 거대한 Context를 도메인별로 분리

**🔻 Before: 모든 상태가 하나의 Context에 집중**

```typescript
// ❌ 문제: 하나의 Context가 모든 애플리케이션 상태를 관리
interface AppContextValue {
  // 사용자 관련
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  
  // 장바구니 관련
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  
  // 상품 관련
  products: Product[];
  selectedProduct: Product | null;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  
  // UI 상태
  isLoading: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  setLoading: (loading: boolean) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextValue>(null);

// 모든 컴포넌트가 거대한 Context를 구독
function Header() {
  const context = useContext(AppContext);
  // user와 cartCount만 필요하지만 전체 Context 구독으로 불필요한 리렌더링 발생
  
  return (
    <header>
      <span>{context?.user?.name || '게스트'}</span>
      <span>장바구니 ({context?.cartCount})</span>
    </header>
  );
}

function ProductList() {
  const context = useContext(AppContext);
  // products만 필요하지만 다른 상태 변경에도 리렌더링 됨
  
  return (
    <div>
      {context?.products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**🔺 After: 도메인별로 분리된 Context 구조**

```typescript
// ✅ 사용자 도메인 Context
interface UserContextValue {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextValue>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  const contextValue = useMemo(() => ({
    user,
    isLoggedIn: user !== null,
    setUser,
  }), [user]);
  
  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
}

// ✅ 장바구니 도메인 Context
interface CartContextValue {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
}

const CartContext = createContext<CartContextValue>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  const cartCount = useMemo(() => cartItems.length, [cartItems]);
  
  const addToCart = useCallback((item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  }, []);
  
  const removeFromCart = useCallback((itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);
  
  const contextValue = useMemo(() => ({
    cartItems,
    cartCount,
    addToCart,
    removeFromCart,
  }), [cartItems, cartCount, addToCart, removeFromCart]);
  
  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

// ✅ 상품 도메인은 React Query로 관리 (Context 대신)
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });
}

// ✅ 최적화된 컴포넌트들
function Header() {
  const { user } = useUser();           // 사용자 상태만 구독
  const { cartCount } = useCart();      // 장바구니 상태만 구독
  
  return (
    <header>
      <span>{user?.name || '게스트'}</span>
      <span>장바구니 ({cartCount})</span>
    </header>
  );
}

function ProductList() {
  const { data: products = [] } = useProducts();  // 서버 상태는 React Query로
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// ✅ 조합하여 사용
function App() {
  return (
    <UserProvider>
      <CartProvider>
        <QueryClient client={queryClient}>
          <Header />
          <ProductList />
          {/* 기타 컴포넌트들 */}
        </QueryClient>
      </CartProvider>
    </UserProvider>
  );
}
```

**📝 개선 포인트:**
- **성능 최적화**: 각 컴포넌트가 필요한 상태만 구독하여 불필요한 리렌더링 제거
- **관심사 분리**: 사용자, 장바구니, 상품 등 도메인별로 Context 분리
- **서버 상태 최적화**: 상품 데이터는 Context 대신 React Query로 관리
- **에러 처리**: Provider 누락 시 명확한 에러 메시지 제공
- **메모이제이션**: `useMemo`와 `useCallback`으로 불필요한 재계산 방지

### 🔹 React Query 세밀 전략

서버를 진실 소스(Single Source of Truth)로 지정하고, 캐시키는 입력에만 의존

```typescript
// ✅ Good: 입력 기반 캐시 키
const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: () => fetchProduct(productId),
  });
};

const useProductList = (categoryId: string, page: number) => {
  return useQuery({
    queryKey: ['products', categoryId, page],
    queryFn: () => fetchProducts({ categoryId, page }),
  });
};

// 캐시 전략별 설정값 가이드
const queryConfigs = {
  // 리스트 데이터: 중간 정도 캐시
  productList: {
    staleTime: 5 * 60 * 1000,    // 5분
    gcTime: 30 * 60 * 1000,      // 30분
  },
  
  // 상세 데이터/메타 정보: 긴 캐시
  productDetail: {
    staleTime: 30 * 60 * 1000,   // 30분
    gcTime: 60 * 60 * 1000,      // 1시간
  },
  
  // 실시간 데이터 (재고/가격): 짧은 캐시
  productPrice: {
    staleTime: 30 * 1000,        // 30초
    gcTime: 5 * 60 * 1000,       // 5분
    refetchOnWindowFocus: true,
  },
};
```

### 🔹 선택(Select)·셀렉터로 응답 변환

React Query 응답을 얕게 변환하여 리렌더링 최소화

```typescript
// ✅ Good: select를 활용한 데이터 변환
const useProductNames = (categoryId: string) => {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: () => fetchProducts(categoryId),
    select: (data) => data.products.map(product => ({
      id: product.id,
      name: product.name,
    })), // 필요한 필드만 선택하여 불필요한 리렌더링 방지
  });
};

// Custom selector 훅 패턴
function useCartItemCount() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    select: (data) => data.items.length,
  });
}
```

### 🔹 변이(Mutation) 후 정밀 무효화

관련된 쿼리만 선택적으로 무효화하여 성능 최적화

```typescript
const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addItemToCart,
    onSuccess: (data, variables) => {
      // 정밀한 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['cart']
      });
      
      // 특정 상품의 재고 정보도 업데이트
      queryClient.invalidateQueries({
        queryKey: ['product', variables.productId]
      });
      
      // 전체 상품 목록은 무효화하지 않음 (성능 고려)
    },
    onError: (error) => {
      // 에러 처리
      console.error('장바구니 추가 실패:', error);
    },
  });
};

// Optimistic Update 패턴
const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCartItemQuantity,
    onMutate: async (newItem) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      
      // 이전 데이터 스냅샷
      const previousCart = queryClient.getQueryData(['cart']);
      
      // Optimistic update
      queryClient.setQueryData(['cart'], (old: Cart) => ({
        ...old,
        items: old.items.map(item => 
          item.id === newItem.id 
            ? { ...item, quantity: newItem.quantity }
            : item
        ),
      }));
      
      return { previousCart };
    },
    onError: (err, newItem, context) => {
      // 에러 시 롤백
      queryClient.setQueryData(['cart'], context?.previousCart);
    },
    onSettled: () => {
      // 항상 최신 데이터로 갱신
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
};
```

---

## 8. 리팩토링 체크리스트

해당 체크리스트는 꼭 전부 체크는 할 필요는 없다.
어떤 코드를 리팩토링하는지에 따라서 선택적으로 체크 하면 된다.

### 🔍 사전 분석 (리팩토링 전 필수)

#### 코드 품질 진단
- [ ] **중복 코드 식별**: 동일하거나 유사한 로직이 3곳 이상 반복되는 곳 찾기
- [ ] **매직 넘버/문자열 검출**: 하드코딩된 숫자, 문자열을 상수로 추출할 곳 식별
- [ ] **복잡도 측정**: 함수/컴포넌트 길이 50줄 이상, 중첩 깊이 3단계 이상인 곳 마킹
- [ ] **타입 안정성 점검**: `any`, `@ts-ignore`, `as any` 사용처 전수 조사

#### 아키텍처 분석
- [ ] **의존성 방향**: 상위 레이어가 하위 레이어에 의존하는 역방향 의존성 확인
- [ ] **책임 분리**: 하나의 컴포넌트에서 UI + 비즈니스 로직 + 데이터 관리를 모두 하는 곳 식별
- [ ] **props drilling**: 3단계 이상 props 전달이 발생하는 컴포넌트 트리 확인

### 🏗️ 구조 개선 (핵심 리팩토링)

#### 컴포넌트 분리
- [ ] **단일 책임**: 각 컴포넌트가 하나의 명확한 역할만 수행하는지 확인
- [ ] **Container/Presentational 분리**: 비즈니스 로직(containers/)과 UI(components/) 명확히 구분
- [ ] **커스텀 훅 추출**: 상태 관리, 사이드 이펙트, 계산 로직을 `useXxx` 훅으로 분리

#### 모듈화 및 구조
- [ ] **파일 크기**: 단일 파일 200줄 이하 유지 (복잡한 경우 300줄 한도)
- [ ] **import 정리**: 절대 경로(`@/`) 일관 사용, 사용하지 않는 import 제거
- [ ] **상수 관리**: `src/constants/` 또는 기존 상수 파일 활용 (새 파일 생성 금지)
- [ ] **타입 정의**: `src/types/` 또는 컴포넌트 동일 파일 내 interface 정의

#### 홈플러스 프로젝트 특화 항목
- [ ] **Rematch 모델**: 전역 상태는 `src/rematch/models/`의 도메인별 모델 활용
- [ ] **React Query**: 서버 상태는 React Query로 관리, 적절한 캐시 전략 설정
- [ ] **Mantine UI 규칙**: CMS 페이지(`pages/cms/`)에서만 Mantine 컴포넌트 사용 준수

### ⚡ 성능 최적화 (선택적 적용)

#### 렌더링 최적화
- [ ] **불필요한 리렌더링 식별**: React DevTools Profiler로 성능 병목 확인
- [ ] **메모이제이션 검토**: `useMemo`, `useCallback` 과도한 사용 제거 (성능 개선이 명확한 경우만 유지)
- [ ] **key 최적화**: 리스트 렌더링 시 안정적인 고유 ID를 key로 사용

#### 번들 최적화  
- [ ] **불필요한 의존성**: 사용하지 않는 라이브러리, 큰 용량의 패키지 제거
- [ ] **코드 스플리팅**: 페이지별 지연 로딩(`React.lazy`) 적용 검토

### 📝 코드 품질 및 유지보수성

#### 가독성
- [ ] **변수/함수명**: 의도가 명확히 드러나는 이름으로 리네이밍
- [ ] **함수 길이**: 단일 함수 30줄 이하 권장 (복잡한 로직은 분할)
- [ ] **중첩 최소화**: if문, 반복문 중첩 깊이 3단계 이하 유지

#### 타입 안정성
- [ ] **Props 타입**: 모든 컴포넌트 props에 명시적 타입 정의
- [ ] **이벤트 핸들러**: 이벤트 객체 타입 명확히 지정
- [ ] **API 응답**: DTO 타입 활용하여 서버 응답 타입 안정성 확보

#### 에러 처리
- [ ] **경계 처리**: null/undefined 체크, 배열 길이 확인 등 방어 코드 추가
- [ ] **에러 바운더리**: 컴포넌트 레벨 에러 처리 적절히 배치
- [ ] **사용자 경험**: 로딩 상태, 에러 상태 UI 적절히 표시

---

## 9. Mantine UI 사용 지침 (CMS 전용)

### 사용 범위
- **허용**: `src/main/front-app/src/pages/cms/` 하위 파일에서만 사용.
- **금지**: 일반 페이지(`pages/halfPrice`, `pages/search` 등)에서 Mantine 컴포넌트 사용 금지.

### Mantine 관련 라이브러리
```json
{
  "@mantine/core": "8.2.5",
  "@mantine/form": "8.2.5",
  "@mantine/tiptap": "8.2.7",
  "@mantine/notifications": "8.2.5",
  "@mantine/modals": "8.2.5",
  "@mantine/dropzone": "8.2.5",
  "postcss-preset-mantine": "1.17.0"
}
```


### 사용 예시
```typescript
// ✅ Good: CMS 페이지에서만 사용
// src/pages/cms/editor/index.tsx
import { Button, TextInput, Modal } from '@mantine/core';

// ❌ Bad: 일반 페이지에서 Mantine 사용
// src/pages/halfPrice/index.tsx
import { Button } from '@mantine/core'; // 금지!
```

### 원칙


- 현실적이고 단계적인 개선을 우선시 (대규모 리라이트 지양)
- 파일 경로, 함수명, 코드 패턴 등 구체적 실행 단위 중심의 제안
- 답변은 한글로 한다.
- 테스트 코드는 작성하지 않는다.
- 리팩토링 필요 없거나, 모르는 부분은 모른다고 답변한다.

---

### 리팩터링 계획서 작성 시 포맷

리팩터링 계획 문서는 다음 구조로 작성합니다:

1. Executive Summary — 리팩터링 목적과 핵심 요약
2. Current State Analysis — 현재 구조 및 문제점 분석
3. 파일 전체 코드를 보여주지 말고, 함수 단위, 코드 블럭 단위 같이 리팩토링 필요한 코드만 설명 
4. Identified Issues and Opportunities — 개선 포인트 정리 
5. Proposed Refactoring Plan (Phases) — 단계별 구체적 계획 
6. Risk Assessment and Mitigation — 위험 요소 및 대응책


## 10. 참고 자료
### 외부 참고 자료
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [TanStack Query 문서](https://tanstack.com/query/v4/docs/framework/react/overview)
- [Vite 공식 문서](https://vitejs.dev/)
- [Mantine UI 문서](https://mantine.dev/)

---

